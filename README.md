# ifms-pages

Seneca microservice auto-updating and serving static pages content
  
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

## Notes

Original `gitnode` package has been replaced with much slower, `simple-git`, 
due to issues with cloning private repositories.
Following [nodegit](http://radek.io/2015/10/27/nodegit/) blog post solves
cloning issues only, fetching authentication still fails, original commit 
is [here](https://github.com/indieforger/ifms-pages/blob/143574ae29de91ce7503e606490aef0dd770b549/service.js)

Currently used `simple-git` library is a wrapper executing shell commands.
That means git has to be configured on local box.

## Feature list

### Completed features
- service settings stored in `config.json`
- pages directory verification
  - create directory if one doesn't exist 
- git cloning and fast forwarding
  - cloning static pages from configured repositories
  - fast forwarding static pages from configured repositories
- `ignore` flag allowed for `page` config object

### Planned features
- utilise seneca framework as microservice
- auto update page repositories in interval based on config `interval` property
- action serving static files on request

### Optional features
- action removing all repositories from pages directory
- action reloading config.json without app reboot
- action providing pages update status
- store config in database
- add `access` flag to page config option (owner = 0, logged in = 1, guest = 2)
- web interface (reconfiguration, reloading)
- broadcasting update message on repository update (page.update object)