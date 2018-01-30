# huntress

A mad method of observing deep object properties and getting callbacks for when they change. Awesome for simple state management.

``` js
import { Watcher as State } from 'huntress'

// start tracking changes to a user's username
State.track('user.username', (username) => {
  console.log('Username is:', username)
})

State.user = {name: 'Joe Bloggs'}
State.user.username = 'joe'
// LOG -- Username is: joe

State.user = {name: 'David', username: 'daveyjones'}
// LOG -- Username is: daveyjones

// -----

// even works with arrays
State.track('user.keys[1].name', (keyName) => {
  console.log('Second key name is:', keyName)
})

State.user.keys = [{name: 'foo'}]
State.user.keys.push({name: 'bar'})
// LOG -- Second key name is: bar

State.user.keys.push({name: 'baz'})
State.user.keys = [{name: 'wham'}, {name: 'bam'}]
// LOG -- Second key name is: bam
State.user.keys = []
// LOG -- Second key name is: undefined
```

### Todo

- [x] Throw callbacks on `delete` calls
- [x] Parse strings like `'user.keys[0].name'` instead of requiring an array of arguments 🤮
- [x] Be able to throw initial callbacks to get listeners up to speed
- [ ] Document
- [ ] Tests
