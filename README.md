# ifms-pages

Seneca microservice auto-updating and serving static content
 
 
## Configuration

sample config.json file
```
{
  "path": "./pages",
  "pages": [{
    "slug": "jewelines",
    "git": "https://github.com/indieforger/ifms-page-jewelines"
  },{
    "slug": "private-ssh",
    "git": "git@bitbucket.org:indieforger/ifms-page-private-test.git",
    "ignore": true,
    "comment": [
      "Private repos can not be cloned on mack due to nodegit library limitations.",
      "Neither https or ssh(git) protocol doesn't seem to work.",
      "check: https://github.com/nodegit/nodegit/issues/497"
    ]
  }]
}
```
