# jquery-fetch
A promise based wrapper around jQuery that dynamically picks between get and post and implements validation and error reporting.

## Download
Find in [Releases](https://github.com/DAud-IcI/jquery-fetch/releases) or just inlcude from cdnjs:
```javascript
<script src="https://cdn.jsdelivr.net/gh/daud-ici/jquery-fetch@0.2/jquery-fetch.min.js"></script>
```


## Configuration
Simply include it into your headers below jQuery.
You can specify a prefix message in the error notification by creating jQuery.fetch as an object prior to importing the library:
```html
<script> jQuery.fetch = { fn_text: "There has been an error:", do_globals: true }; </script>
```
If `do_globals` is true it will export the utility functions into window too:
* delayelay
* animatenimate
* notifyotify
* error_fnrror_fn
* error_alertrror_alert
* error_notifyrror_notify
* error_absorbrror_absorb
* error_makeAlertWithIdrror_absorb

## Usage
```javascript
jQuery.fetch('url', post_data, condition)
    .then(result => do_something_with(result))
    .catch(jQuery.fetch.error.notify);
```

* url and post_data behave the same way as with jQuery.post, if post_data is undefined then jQuery.get will be used
* condition may be either a function or an object
  - If it's a function then `condition(result)` will be called. The promise gets resolved if the function's return value is truthy, rejected otherwise.
  - if it's an object then each property gets compared with the result independently.
  - If it's null or undefined then no validation is done.
