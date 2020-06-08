Sample Create:

```json
{
  "header" : {
    "session_id" : "ECTO-1",
    "user_id" : "683d711e-fe25-443c-8102-43d4245a6884",
    "action" : "create_session"
  },
  "session_name" : "Grooming"
}
```

Created w/ `cat '[the json]' | jq -M -c`:

```json
{"header":{"session_id":"ECTO-1","user_id":"683d711e-fe25-443c-8102-43d4245a6884","action":"create_session"},"session_name":"Grooming"}
```
