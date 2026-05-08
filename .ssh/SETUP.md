# SSH Key Setup

Run this one command in Terminal to let the auto-push task use your existing GitHub SSH key:

```bash
cp ~/.ssh/id_ed25519 ~/Projects/flashcards/.ssh/deploy_key
```

> If your key is named differently (e.g. `id_rsa`), swap that in instead.

That's it. The nightly task will use that key to push changes to GitHub.

The key file is listed in .gitignore so it will never be committed or pushed.
