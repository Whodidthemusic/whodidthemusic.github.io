# CRT Sample download counter

The counter below the artwork on egocorp.io starts at the publisher-supplied **243** on September 3, 2026.

GitHub's persistent release-asset statistics are the source of new downloads, not browser storage or button clicks. The fully unlocked Windows installer asset ID is `525405245`; its GitHub download count was **37** at setup. The formula is `243 + current asset downloads - 37`. The public label is **Downloads**, not unique people or installations. These are GitHub-recorded file downloads, not independently verified completed installations.

The page reads public metadata on load and at most every five minutes while visible. GitHub's own cache can add a short delay. No tokens, cookies, buyer data, or new tracking service are used. Browser storage is an optional last-known cache only; visitors without it still receive the shared count from GitHub. If the statistics service is unavailable, the page labels the saved/starting value accordingly, and the normal download link continues to work.

Do not reset the baseline when redeploying the site. If replacing the release asset or adding a Mac/new-version download, record the existing accumulated total and new asset counts first, then update the tracking configuration and cache key together. Never count checksum files or the old customer installer.

Verification: `node --test tests/download-counter.test.mjs`.
