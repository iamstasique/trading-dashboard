# Trading dashboard

Angular app for the interview task. Account balance, deposit form, deposit history, news.

## How to run

```
npm install
npm start
```

Then open http://localhost:4200. Deposit form lives at `/deposit`.

Tests:

```
npm test
```

## Notes

- Starting balance is just a hardcoded number.
- Deposit is a route, not a random dialog. Home stays under it.
- Deposits go to IndexedDB, so the list is still there after refresh.
- News is from the Spaceflight News API. Sort (newest / oldest) is saved in localStorage.
- On a narrow screen the news widget is in the header drawer, on desktop it's just on the page.

News needs internet. If the API doesn't answer, the widget shows an error and that's it.
