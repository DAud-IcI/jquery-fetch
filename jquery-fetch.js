(function (ctx, error_fn_text, do_globals) {
    function matchObects(a, b) {
        if (!a || !b) return false;
        for (var x in a)
            if (a.hasOwnProperty(x))
                if (!(x in b) || a[x] !== b[x])
                    return false;
        return true;
    }

    function promiseFetchJQ(url, data, condition, xhr_callback) {
        return new Promise(function (resolve, reject) {
            var xhr = (data === undefined ? ctx.jQuery.get : ctx.jQuery.post)(url, data, function (r) {
                if (condition === undefined || condition === null)
                    resolve(r);
                else if (typeof (condition) === 'function')
                    (condition(r) ? resolve : reject)(r);
                else
                (matchObects(condition, r) ? resolve : reject)(r);
            })
                .fail(function (r) { reject(r); });
            if (xhr_callback) xhr_callback(xhr);
        });
    }


    function delay(duration) {
        return function (data) {
            return new Promise(function (resolve) {
                setTimeout(resolve, duration, data);
            });
        };
    }


    function animate(options, duration, easing) {
        return function (x) {
            return new Promise(function (resolve, reject) {
                jQuery(x).animate(options,
                    {
                        duration: duration,
                        easing: easing,
                        done: function () { resolve(x); },
                        fail: function () { reject(x); }
                    });
            });
        };
    }

    var notify = {};
    notify = function () { return notify.callable.apply(this, arguments); };
    notify.callable = function () {
        var text = Array.prototype.slice.apply(arguments).join(' ');
        var notify_box = jQuery('<div>')
            .attr('class', 'notification')
            .text(text.replace(/\n/g, '%nl%'))
            .appendTo(document.body);
        notify_box[0].innerHTML = notify_box[0].innerHTML.replace(/%nl%/g, '<br>');

        return notify.promise = notify.promise
            .then(function () { return notify_box; })
            .then(animate({ 'margin-top': (-1 * notify_box.outerHeight()) + 'px' }, 500))
            .then(delay(text.length * 100))
            .then(animate({ 'margin-top': '0px' }, 1000))
            .then(function () { notify_box.remove(); });
    };
    notify.promise = Promise.resolve();

    var ctx2 = "Notification" in ctx ? ctx : "Notification" in window ? window : null;
    if (ctx2) ctx2.Notification.requestPermission()
            .then(function (permission) {
                if (permission === "granted")
                    notify.callable = function (text) {
                        text = text || '';
                        var t = text.split('\n');
                        var o = {};
                        if (t.length > 1) o.body = t.slice(1).join('\n').trim('\n');
                        return new Notification(t[0], o);
                    };
            })
            .catch(function (x) { notify(x); });


    function error_fn(fn, e) {
        if (e.statusText === 'abort') return;

        if (!e) {
            fn(error_fn_text);
            return;
        }

        var error;

        if (typeof (e) === 'string' || typeof (e) === 'number')
            error = e;
        else if (typeof (e) === 'object' && (e instanceof Error || ('message' in e && 'stack' in e && 'fileName' in e))) {
            error = e.toString() + '\n';
            error += 'in: ' + e.fileName.replace(/^(?:\/\/|[^\/]+)*\//, "/") + '\n'
            error += 'at: ' + e.lineNumber + ' : ' + e.columnNumber + '\n';
            error += e.stack;
        }
        else if ('getResponseHeader' in e) {
            if ((e.getResponseHeader('Content-Type') || '').indexOf('html') >= 0 && 'responseText' in e)
                error = new DOMParser()
                    .parseFromString(e.responseText, 'text/html')
                    .querySelector('title')
                    .textContent
                    .trim();
            else {
                fn(error_fn_text);
                return;
            }
        }
        else if ('error' in e)
            error = e.error;
        else
            error = JSON.stringify(e);

        console.log(e);
        console.log(error);
        fn(error_fn_text + '\n\n' + error);

        return e;
    }
    function error_alert(e) { error_fn(alert, e); throw e; }
    function error_notify(e) { error_fn(notify, e); throw e; }
    function error_absorb(e) { console.log(e); }
    function error_makeAlertWithId(error_id) {
        var id = ("0000" + error_id).slice(-4);
        return function (e) {
            alert("ERROR #" + id + "\n" + (typeof e === 'string' ? e : JSON.stringify(e, null, 2)));
        };
    }

    ctx.jQuery.fetch = function () { return ctx.jQuery.fetch.callable.apply(this, arguments); };
    ctx.jQuery.fetch.callable = promiseFetchJQ;
    ctx.jQuery.fetch.delay = delay;
    ctx.jQuery.fetch.ignoreStatus = [];
    ctx.jQuery.fetch.animate = animate;
    ctx.jQuery.fetch.notify = notify;
    ctx.jQuery.fetch.error = {
        fn: error_fn,
        alert: error_alert,
        notify: error_notify,
        absorb: error_absorb,
        make: { alertWithId: error_makeAlertWithId }
    };

    if (do_globals) {
        ctx.delay = delay;
        ctx.animate = animate;
        ctx.notify = notify;
        ctx.error_fn = error_fn;
        ctx.error_alert = error_alert;
        ctx.error_notify = error_notify;
        ctx.error_absorb = error_absorb;
        ctx.error_makeAlertWithId = error_makeAlertWithId;
    }
})(window, 'fetch' in window.jQuery ? window.jQuery.fetch.fn_text : '', 'fetch' in window.jQuery ? window.jQuery.fetch.do_globals : false);
