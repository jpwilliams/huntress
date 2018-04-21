# huntress

Huntress is a very simple state store with an HOC for React which helps you watch deep properties.

``` sh
yarn add huntress
```

``` js
import { withWatcher} from 'huntress'

const Welcome = ({ name }) => (
  <div>Hi{name ? `, ${name}` : ''}!</div>
)

export default withWatcher({
  name: 'user.profile.displayName'
})(Welcome)
```

The store itself is changed by just mutating.

Huntress will decide on exactly what changed and only send updates to the relevant listeners.

``` js
import { Watcher } from 'huntress'

Watcher.user = myUserObj
Watcher.user.keys[1].headers = { foo: 'bar' }
```

While use with React is its target, Huntress also exposes its tracking API.

``` js
// function track(path: string, callback: function): void
Watcher.track('user.profile.names[0]', (firstName) => {
  console.log(`The user's first name changed to "${firstName}".`)
})

// function stopTracking(path: string, fn?: function): void
Watcher.stopTracking('user.profile.displayName')
```

Try it out. It's fun.
