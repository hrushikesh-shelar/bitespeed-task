# bitespeed-task
Backend Task Submission for Bitespeed

Task Link: https://bitespeed.notion.site/Bitespeed-Backend-Task-Identity-Reconciliation-53392ab01fe149fab989422300423199

--- 
Instructions: 

* Exposed port: 4000

* Db configs for here: Update in file 'models/db.js'
- user: 'hrushikesh',
- password: 'hrushikesh',
- host: 'localhost',
- port: 5432,
- database: 'bitespeed',

1. Postgres Database should be running on port 5432 as in the above configs.
2. Create table 'contacts' in database 'bitespeed' as shown in the 'db.sql' file.
3. 'npm run start' / 'npm run watch' to start service.
4.  Postman sample curl:
   
   ```
curl --location 'http://localhost:4000/identify' \
--header 'Content-Type: application/json' \
--data '{
    "phoneNumber": "156",
    "email": "by2"
}'
```


