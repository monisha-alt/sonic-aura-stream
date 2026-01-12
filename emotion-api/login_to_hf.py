#!/usr/bin/env python
"""Simple script to login to Hugging Face Hub"""
import sys
from huggingface_hub import login

def main():
    if len(sys.argv) > 1:
        token = sys.argv[1]
        login(token=token)
        print(" Logged in successfully!")
    else:
        print(" Hugging Face Login")
        print("=" * 50)
        print("\nGet your token from: https://huggingface.co/settings/tokens")
        print("(Create a token with 'Write' permissions)\n")
        token = input("Enter your token: ").strip()
        if token:
            login(token=token)
            print("\n Logged in successfully!")
        else:
            print(" No token provided")
            sys.exit(1)

if __name__ == "__main__":
    main()
