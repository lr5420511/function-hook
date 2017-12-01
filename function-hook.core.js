(function(win) {

    win.HookMainifest = function(host, method, methodInstance) {
        if (host instanceof Object && typeof method === "string" && methodInstance instanceof Function) {
            this.Host = host;
            this.Method = method;
            this.MethodInstance = methodInstance;
        } else {
            throw new Error("window.HookMainifest: The instance of HookMainifest can't creat!");
        }
    };
    win.HookMainifest.prototype.construtor = win.HookMainifest;

    win.HookMainifest.OverrideMethods = [];
    win.HookMainifest.GetIndexOfMethodEntry = function(host, method) {
        var eIndex;
        for (var index = 0; index < win.HookMainifest.OverrideMethods.length; index++) {
            var currentMethodEntry = win.HookMainifest.OverrideMethods[index];
            if (host === currentMethodEntry.Host && method === currentMethodEntry.Method) {
                eIndex = index;
                break;
            } else {
                continue;
            }
        }
        return eIndex;
    };
    win.HookMainifest.MethodIsExist = function(host, method) {
        return typeof win.HookMainifest.GetIndexOfMethodEntry(host, method) !== "undefined";
    };
    win.HookMainifest.GetMethodInstance = function(host, method) {
        var eIndex = win.HookMainifest.GetIndexOfMethodEntry(host, method);
        return typeof eIndex === "undefined" ?
            undefined : win.HookMainifest.OverrideMethods[eIndex].MethodInstance;
    };
    win.HookMainifest.InsertMethodEntry = function(host, method, methodInstance) {
        win.HookMainifest.OverrideMethods.push(new win.HookMainifest(host, method, methodInstance));
    };
    win.HookMainifest.RemoveMethodEntry = function(host, method) {
        var eIndex = win.HookMainifest.GetIndexOfMethodEntry(host, method);
        if (typeof eIndex === "undefined") {
            throw new Error("window.HookMainifest.RemoveMethodEntry: The instance of HookMainifest can't remove!");
        }
        win.HookMainifest.OverrideMethods.splice(eIndex, 1);
    };

    win.HookMainifest.InstallHook = function(host, method, isProto, beginCall, afterCall) {
        if (typeof isProto !== "boolean") {
            isProto = false;
        }
        if (isProto && !(host instanceof Function)) {
            throw new Error("window.HookMainifest.InstallHook: The host isn't instance of Function!");
        }
        if (!isProto && !(host instanceof Object)) {
            throw new Error("window.HookMainifest.InstallHook: The host isn't instance of Object");
        }
        if (isProto && !host.prototype.hasOwnProperty(method)) {
            throw new Error("window.HookMainifest.InstallHook: The prototype object of host class hasn't " + method + " method!");
        }
        if (!isProto && !host.hasOwnProperty(method)) {
            throw new Error("window.HookMainifest.InstallHook: The instance object of host hasn't " + method + " method!");
        }
        host = isProto ? host.prototype : host;
        if (win.HookMainifest.MethodIsExist(host, method)) {
            throw new Error("window.HookMainifest.InstallHook: The method of host has hooked, please retry after uninstall!");
        }
        var methodCloneOfOverride = host[method];
        win.HookMainifest.InsertMethodEntry(host, method, methodCloneOfOverride);
        Object.defineProperty(host, method, {
            value: function() {
                var isCall = true;
                var returnValue;
                if (beginCall instanceof Function) {
                    isCall = beginCall(this, arguments);
                }
                if (isCall) {
                    returnValue = methodCloneOfOverride.apply(this, arguments);
                    returnValue = afterCall instanceof Function ?
                        afterCall(this, arguments, returnValue) : returnValue;
                }
                return returnValue;
            }
        });
    };
    win.HookMainifest.UnInstallHook = function(host, method, isProto) {
        host = (host instanceof Function && isProto) ? host.prototype : host;
        if (!win.HookMainifest.MethodIsExist(host, method)) {
            throw new Error("window.HookMainifest.UnInstallHook: The method hasn't hook of installed!");
        }
        var currentMethodInstance = win.HookMainifest.GetMethodInstance(host, method);
        Object.defineProperty(host, method, { value: currentMethodInstance });
        win.HookMainifest.RemoveMethodEntry(host, method);
    };

})(window)