#!/bin/bash
# Publish queue.json to the public feed repo as a single amended commit.
# One-way Mac -> cloud. The feed repo holds NOTHING but the snapshot.
# Token is passed via a per-process env var + GIT_ASKPASS so it never
# appears on a command line (ps-visible) or in any .git/config.
set -euo pipefail
SRC="$1"
FEED_DIR="$HOME/scripts/blacksmith-queue/feed-repo"
export GH_FEED_TOKEN
GH_FEED_TOKEN=$(cat "$HOME/.config/automaitions_gh_token")
ASKPASS="$HOME/scripts/blacksmith-queue/.askpass.sh"
if [ ! -x "$ASKPASS" ]; then
  printf '#!/bin/bash\ncase "$1" in *sername*) echo automaitions;; *) echo "$GH_FEED_TOKEN";; esac\n' > "$ASKPASS"
  chmod 700 "$ASKPASS"
fi

if [ ! -d "$FEED_DIR/.git" ]; then
  git init -q -b main "$FEED_DIR"
  git -C "$FEED_DIR" config user.name "blacksmith-queue-bot"
  git -C "$FEED_DIR" config user.email "jettsclaw@gmail.com"
fi
cp "$SRC" "$FEED_DIR/queue.json"
cd "$FEED_DIR"
git add queue.json
# Single rolling commit: amend + force keeps the repo at one commit forever.
if git rev-parse HEAD >/dev/null 2>&1; then
  git commit -q --amend -m "live snapshot" --no-edit
else
  git commit -q -m "live snapshot"
fi
# -c credential.helper= disables the keychain (it would win over GIT_ASKPASS
# and push as the wrong account).
GIT_ASKPASS="$ASKPASS" git -c credential.helper= push -q --force \
  https://github.com/automaitions/blacksmith-queue-feed.git main 2>/dev/null
