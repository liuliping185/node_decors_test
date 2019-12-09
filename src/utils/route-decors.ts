import * as glob from 'glob';
import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import * as  Parameter from 'parameter'

type HTTPMethod = 'get' | 'put' | 'del' | 'post' | 'patch';
type LoadOptions = {
/**
* 路由文件扩展名，默认值是`.{js,ts}` */
    extname?: string;
};
type RouteOptions = {
    /**
* 适用于某个请求比较特殊，需要单独制定前缀的情形
*/
    prefix?: string;
    /**
* 给当前路由添加一个或多个中间件
*/
    middlewares?: Array<Koa.Middleware>;
};

const router = new KoaRouter()

export const decorate = (method: HTTPMethod, path:string, options:RouteOptions = {},router: KoaRouter) =>{
	return (target,property:string) =>{
			process.nextTick(()=>{
				const middlewares = []
				if(target.middlewares){
					middlewares.push(...target.middlewares)
				}

			  if(options.middlewares){
			  	middlewares.push(...options.middlewares)
			  }
			  middlewares.push(target[property])

		    const url = options && options.prefix ? options.prefix + path : path
		    router[method](url, ...middlewares)
	    })
	}
}

const method = method => (path:string, options?:RouteOptions) => decorate(method, path, options, router)

export const get = method('get')
export const post = method('post')
export const put = method('put')
export const del = method('del')
export const patch = method('patch')

export const middlewares = function middlewares(middlewares: Koa.Middleware[]){
	return function(target){
		target.prototype.middlewares = middlewares
	}
}

export const load = (folder:string,options: LoadOptions = {}) : KoaRouter => {
	const extname = options.extname || ".{.js,ts}"
	glob.sync(require("path").join(folder,`./**/*${extname}`))
		.forEach(item => require(item))
  return router
}

const validateRule = paramPart => rule => {
    return function (target, name, descriptor) {
        const oldValue = descriptor.value
        descriptor.value = function () {
            const ctx = arguments[0]
            const p = new Parameter()
            const data = ctx[paramPart]
            const errors = p.validate(rule, data)
           
            if (errors) {
            		throw new Error(JSON.stringify(errors))

            }else{
                return oldValue.apply(null, arguments);
            }
        }

        return descriptor;
    }
}

export const querystring = validateRule('query')
export const body = validateRule('body')
	
