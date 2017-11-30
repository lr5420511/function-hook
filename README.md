# function-hook
javascript函数钩子( javascript function hook ).

   通过调用HookMainifest.InstallHook和HookMainifest.UnInstallHook两个函数，可以对钩子进行管理。
InstallHook函数可以对所有的原型方法和实例方法挂钩。当对系统预置方法挂钩时，将会影响系统内所有的函数调用，利用这个特点可以用来改造原生javascript方法或者第三方库内的方法。

   挂钩原理基于函数重写，下面简单说明安装钩子函数（InstallHook）和卸载钩子函数（UnInstallHook）:
   HookMainifest.InstallHook(host, method, isProto, beginCall, afterCall)
   安装钩子到指定的方法，如果指定的方法已经挂载钩子，则返回异常;
   参数host：表示钩子挂载的宿主，他可以是任意的Object或者它的派生类对应的实例，当然也可以是Function类型的对象;
   参数method: 表示要挂载钩子的宿主实例对象上的方法，这个方法可以是一个类静态方法，也可以是对象的实例方法，还可以是类型的原型方法（挂载原型方法时会影响该类型的所有实例，并且与实例的创建时间无关）;
   参数isProto: 表示方法是否在宿主的原型对象上，当这个参数值为true时，参数host必须是Function类型的实例;
   回调函数beginCall: 在调用源方法之前调用，它的返回值为true时，调用源方法；否则不调用源方法和afterCall。函数返回undefined;
   回调函数afterCall: 在调用源方法之后调用，它的返回值就是函数的返回值，所以我们可以在这个回调函数内部加工函数的返回值;

   HookMainifest.UnInstallHook(host, method, isProto)
   卸载已经安装的钩子，如果钩子未安装则抛出异常;

   如果我们要挂载钩子到所有Array实例的push方法中，代码如下：

   HookMainifest.InstallHook(Array, "push", true, 
     function(ins, arguments) {
       console.log(ins);
       console.log(arguments);
       return true;
     },
     function(ins, arguments, returnValue) {
       console.log(ins);
       console.log(returnValue);
       return "返回值已经被串改！";
     }
   );

   卸载这个钩子： HookMainifest.UnInstallHook(Array, "push", true);

   如果我们要修改Date.parse函数的功能，想让它直接返回一个Date类型的实例,而不是总毫秒数时：

   HookMainifest.InstallHook(Date, "parse", false,
     function(ins, arguments) {
       return true; //返回false时，源生方法不会被调用
     },
     function(ins, arguments, returnValue) {
       return new Date(returnValue);
     }
   );

使用它，我们可以方便的改造原生方法或者其他第三方库的方法。
