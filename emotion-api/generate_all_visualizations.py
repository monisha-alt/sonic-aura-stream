"""
Generate All Visualizations for Emotion Detection Model
Creates confusion matrix, performance charts, and other visualizations
"""

import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import json
from pathlib import Path
from datetime import datetime

# Set style
sns.set_style("whitegrid")
plt.rcParams['figure.dpi'] = 150
plt.rcParams['savefig.dpi'] = 150

def load_metrics():
    """Load evaluation metrics from JSON file"""
    metrics_file = Path("evaluation_results/evaluation_metrics.json")
    with open(metrics_file, 'r') as f:
        return json.load(f)

def generate_confusion_matrix(metrics, output_dir):
    """Generate confusion matrix heatmap"""
    cm = np.array(metrics['confusion_matrix'])
    label_names = ['neutral', 'calm', 'happy', 'sad', 'angry', 'fearful', 'disgust', 'surprised']
    
    plt.figure(figsize=(12, 10))
    
    # Calculate percentages for better visualization
    cm_percent = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis] * 100
    
    # Create heatmap with both counts and percentages
    annot = np.empty_like(cm).astype(str)
    for i in range(len(label_names)):
        for j in range(len(label_names)):
            annot[i, j] = f'{cm[i, j]}\n({cm_percent[i, j]:.1f}%)'
    
    sns.heatmap(cm, annot=annot, fmt='', cmap='Blues', 
               xticklabels=label_names, yticklabels=label_names,
               cbar_kws={'label': 'Count'},
               linewidths=0.5, linecolor='gray')
    
    plt.title('Confusion Matrix - Emotion Detection Model\n(Counts and Percentages)', 
              fontsize=16, fontweight='bold', pad=20)
    plt.ylabel('True Label', fontsize=12, fontweight='bold')
    plt.xlabel('Predicted Label', fontsize=12, fontweight='bold')
    plt.xticks(rotation=45, ha='right')
    plt.yticks(rotation=0)
    plt.tight_layout()
    
    output_file = output_dir / "confusion_matrix.png"
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"✅ Confusion matrix saved to: {output_file}")
    return output_file

def generate_performance_charts(metrics, output_dir):
    """Generate per-class performance charts"""
    per_class = metrics['per_class_metrics']
    emotions = ['neutral', 'calm', 'happy', 'sad', 'angry', 'fearful', 'disgust', 'surprised']
    
    precision = [per_class[emotion]['precision'] * 100 for emotion in emotions]
    recall = [per_class[emotion]['recall'] * 100 for emotion in emotions]
    f1 = [per_class[emotion]['f1-score'] * 100 for emotion in emotions]
    
    fig, axes = plt.subplots(1, 3, figsize=(18, 6))
    
    # Precision chart
    axes[0].barh(emotions, precision, color='skyblue', edgecolor='navy', linewidth=1.5)
    axes[0].set_xlabel('Precision (%)', fontsize=12, fontweight='bold')
    axes[0].set_title('Precision by Emotion', fontsize=14, fontweight='bold')
    axes[0].set_xlim(0, 100)
    axes[0].grid(axis='x', alpha=0.3)
    for i, v in enumerate(precision):
        axes[0].text(v + 1, i, f'{v:.1f}%', va='center', fontweight='bold')
    
    # Recall chart
    axes[1].barh(emotions, recall, color='lightgreen', edgecolor='darkgreen', linewidth=1.5)
    axes[1].set_xlabel('Recall (%)', fontsize=12, fontweight='bold')
    axes[1].set_title('Recall by Emotion', fontsize=14, fontweight='bold')
    axes[1].set_xlim(0, 100)
    axes[1].grid(axis='x', alpha=0.3)
    for i, v in enumerate(recall):
        axes[1].text(v + 1, i, f'{v:.1f}%', va='center', fontweight='bold')
    
    # F1-Score chart
    axes[2].barh(emotions, f1, color='salmon', edgecolor='darkred', linewidth=1.5)
    axes[2].set_xlabel('F1-Score (%)', fontsize=12, fontweight='bold')
    axes[2].set_title('F1-Score by Emotion', fontsize=14, fontweight='bold')
    axes[2].set_xlim(0, 100)
    axes[2].grid(axis='x', alpha=0.3)
    for i, v in enumerate(f1):
        axes[2].text(v + 1, i, f'{v:.1f}%', va='center', fontweight='bold')
    
    plt.tight_layout()
    output_file = output_dir / "performance_charts.png"
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"✅ Performance charts saved to: {output_file}")
    return output_file

def generate_precision_recall_scatter(metrics, output_dir):
    """Generate precision-recall scatter plot"""
    per_class = metrics['per_class_metrics']
    emotions = ['neutral', 'calm', 'happy', 'sad', 'angry', 'fearful', 'disgust', 'surprised']
    
    precision = [per_class[emotion]['precision'] * 100 for emotion in emotions]
    recall = [per_class[emotion]['recall'] * 100 for emotion in emotions]
    
    plt.figure(figsize=(10, 8))
    
    # Plot points
    colors = ['red' if e == 'sad' else 'green' if e == 'angry' else 'blue' for e in emotions]
    plt.scatter(recall, precision, s=200, c=colors, alpha=0.6, edgecolors='black', linewidth=2)
    
    # Add labels
    for i, emotion in enumerate(emotions):
        plt.annotate(emotion.capitalize(), 
                    (recall[i], precision[i]),
                    xytext=(5, 5), textcoords='offset points',
                    fontsize=10, fontweight='bold')
    
    # Add diagonal line (perfect balance)
    plt.plot([0, 100], [0, 100], 'k--', alpha=0.3, label='Perfect Balance')
    
    plt.xlabel('Recall (%)', fontsize=12, fontweight='bold')
    plt.ylabel('Precision (%)', fontsize=12, fontweight='bold')
    plt.title('Precision vs Recall - Emotion Detection Model', fontsize=14, fontweight='bold')
    plt.xlim(40, 100)
    plt.ylim(55, 90)
    plt.grid(True, alpha=0.3)
    plt.legend()
    plt.tight_layout()
    
    output_file = output_dir / "precision_recall_scatter.png"
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"✅ Precision-Recall scatter plot saved to: {output_file}")
    return output_file

def generate_overall_metrics_chart(metrics, output_dir):
    """Generate overall metrics comparison chart"""
    metrics_names = ['Accuracy', 'Macro F1', 'Weighted F1', 'Confidence']
    metrics_values = [
        metrics['accuracy'] * 100,
        metrics['f1_macro'] * 100,
        metrics['f1_weighted'] * 100,
        metrics['average_confidence'] * 100
    ]
    
    plt.figure(figsize=(10, 6))
    bars = plt.bar(metrics_names, metrics_values, 
                   color=['#4CAF50', '#2196F3', '#FF9800', '#9C27B0'],
                   edgecolor='black', linewidth=2)
    
    # Add value labels on bars
    for bar, value in zip(bars, metrics_values):
        plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 1,
                f'{value:.2f}%', ha='center', va='bottom', fontweight='bold', fontsize=12)
    
    plt.ylabel('Percentage (%)', fontsize=12, fontweight='bold')
    plt.title('Overall Model Performance Metrics', fontsize=14, fontweight='bold')
    plt.ylim(0, 100)
    plt.grid(axis='y', alpha=0.3)
    plt.tight_layout()
    
    output_file = output_dir / "overall_metrics.png"
    plt.savefig(output_file, dpi=300, bbox_inches='tight')
    plt.close()
    print(f"✅ Overall metrics chart saved to: {output_file}")
    return output_file

def main():
    """Main function to generate all visualizations"""
    print("="*80)
    print("GENERATING ALL VISUALIZATIONS")
    print("="*80)
    
    # Create output directory
    output_dir = Path("evaluation_results/visualizations")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Load metrics
    print("\n📊 Loading evaluation metrics...")
    metrics = load_metrics()
    
    # Generate all visualizations
    print("\n🎨 Generating visualizations...\n")
    
    try:
        generate_confusion_matrix(metrics, output_dir)
        generate_performance_charts(metrics, output_dir)
        generate_precision_recall_scatter(metrics, output_dir)
        generate_overall_metrics_chart(metrics, output_dir)
        
        print("\n" + "="*80)
        print("✅ ALL VISUALIZATIONS GENERATED SUCCESSFULLY!")
        print("="*80)
        print(f"\n📁 Output directory: {output_dir.absolute()}")
        print("\nGenerated files:")
        print("  ✅ confusion_matrix.png")
        print("  ✅ performance_charts.png")
        print("  ✅ precision_recall_scatter.png")
        print("  ✅ overall_metrics.png")
        
    except Exception as e:
        print(f"\n❌ Error generating visualizations: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
