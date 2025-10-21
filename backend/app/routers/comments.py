from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.database import get_db
from app.models import Comment, Reaction, User
from app.core.auth import get_current_user

router = APIRouter()

class CommentCreate(BaseModel):
    song_id: int
    content: str
    timestamp: float
    parent_id: Optional[int] = None

class CommentResponse(BaseModel):
    id: int
    content: str
    timestamp: float
    user: dict
    reactions: dict
    replies: Optional[List['CommentResponse']] = []
    created_at: datetime

class ReactionCreate(BaseModel):
    comment_id: int
    reaction_type: str

@router.get("/")
async def get_comments(
    song_id: int = Query(...),
    timestamp: Optional[float] = Query(None),
    db: Session = Depends(get_db)
):
    """Get comments for a song, optionally filtered by timestamp"""
    query = db.query(Comment).filter(Comment.song_id == song_id)
    
    if timestamp is not None:
        # Get comments within 30 seconds of the timestamp
        query = query.filter(
            Comment.timestamp >= timestamp - 15,
            Comment.timestamp <= timestamp + 15
        )
    
    comments = query.order_by(Comment.timestamp, Comment.created_at).all()
    
    # Format response
    result = []
    for comment in comments:
        # Get reactions
        reactions = db.query(Reaction).filter(
            Reaction.comment_id == comment.id
        ).all()
        
        reaction_counts = {
            "likes": len([r for r in reactions if r.type == "likes"]),
            "hearts": len([r for r in reactions if r.type == "hearts"]),
            "thumbs_up": len([r for r in reactions if r.type == "thumbs_up"])
        }
        
        # Get replies
        replies = db.query(Comment).filter(
            Comment.parent_id == comment.id
        ).order_by(Comment.created_at).all()
        
        formatted_replies = []
        for reply in replies:
            reply_reactions = db.query(Reaction).filter(
                Reaction.comment_id == reply.id
            ).all()
            
            reply_reaction_counts = {
                "likes": len([r for r in reply_reactions if r.type == "likes"]),
                "hearts": len([r for r in reply_reactions if r.type == "hearts"]),
                "thumbs_up": len([r for r in reply_reactions if r.type == "thumbs_up"])
            }
            
            formatted_replies.append({
                "id": reply.id,
                "content": reply.content,
                "timestamp": reply.timestamp,
                "user": {
                    "id": reply.user.id,
                    "username": reply.user.username,
                    "avatar": reply.user.avatar_url
                },
                "reactions": reply_reaction_counts,
                "created_at": reply.created_at
            })
        
        result.append({
            "id": comment.id,
            "content": comment.content,
            "timestamp": comment.timestamp,
            "user": {
                "id": comment.user.id,
                "username": comment.user.username,
                "avatar": comment.user.avatar_url
            },
            "reactions": reaction_counts,
            "replies": formatted_replies,
            "created_at": comment.created_at
        })
    
    return {"comments": result}

@router.post("/")
async def create_comment(
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new comment"""
    comment = Comment(
        content=comment_data.content,
        timestamp=comment_data.timestamp,
        user_id=current_user.id,
        song_id=comment_data.song_id,
        parent_id=comment_data.parent_id
    )
    
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    return {
        "id": comment.id,
        "content": comment.content,
        "timestamp": comment.timestamp,
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "avatar": current_user.avatar_url
        },
        "reactions": {"likes": 0, "hearts": 0, "thumbs_up": 0},
        "created_at": comment.created_at
    }

@router.post("/react")
async def add_reaction(
    reaction_data: ReactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a reaction to a comment"""
    # Check if user already reacted to this comment
    existing_reaction = db.query(Reaction).filter(
        Reaction.comment_id == reaction_data.comment_id,
        Reaction.user_id == current_user.id,
        Reaction.type == reaction_data.reaction_type
    ).first()
    
    if existing_reaction:
        # Remove existing reaction
        db.delete(existing_reaction)
        db.commit()
    else:
        # Add new reaction
        reaction = Reaction(
            type=reaction_data.reaction_type,
            user_id=current_user.id,
            comment_id=reaction_data.comment_id
        )
        db.add(reaction)
        db.commit()
    
    # Get updated reaction counts
    reactions = db.query(Reaction).filter(
        Reaction.comment_id == reaction_data.comment_id
    ).all()
    
    reaction_counts = {
        "likes": len([r for r in reactions if r.type == "likes"]),
        "hearts": len([r for r in reactions if r.type == "hearts"]),
        "thumbs_up": len([r for r in reactions if r.type == "thumbs_up"])
    }
    
    return {"reactions": reaction_counts}

@router.delete("/{comment_id}")
async def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a comment (only by the author)"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
    
    # Soft delete by setting is_active to False
    comment.is_active = False
    db.commit()
    
    return {"message": "Comment deleted successfully"}

@router.get("/{comment_id}/replies")
async def get_comment_replies(
    comment_id: int,
    db: Session = Depends(get_db)
):
    """Get replies for a specific comment"""
    replies = db.query(Comment).filter(
        Comment.parent_id == comment_id,
        Comment.is_active == True
    ).order_by(Comment.created_at).all()
    
    result = []
    for reply in replies:
        reactions = db.query(Reaction).filter(
            Reaction.comment_id == reply.id
        ).all()
        
        reaction_counts = {
            "likes": len([r for r in reactions if r.type == "likes"]),
            "hearts": len([r for r in reactions if r.type == "hearts"]),
            "thumbs_up": len([r for r in reactions if r.type == "thumbs_up"])
        }
        
        result.append({
            "id": reply.id,
            "content": reply.content,
            "timestamp": reply.timestamp,
            "user": {
                "id": reply.user.id,
                "username": reply.user.username,
                "avatar": reply.user.avatar_url
            },
            "reactions": reaction_counts,
            "created_at": reply.created_at
        })
    
    return {"replies": result}
