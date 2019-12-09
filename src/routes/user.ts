import * as Koa from "koa"
import {get,post,middlewares,querystring} from "../utils/route-decors"

import model from "../model/user"

const user = [{name: "tom", age: 18}]

const api = {
    age(value) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (value > 18) {
                    reject('年龄太大')
                } else {
                    resolve()
                }
            }, 500)
        })
    }
}

@middlewares([
    async function guard(ctx,next){
        console.log("111",ctx.header)
        if(ctx.header.token){
        	await next()
        }else{
          throw "请登录。。。"
        }
    }
])
export default class User{
  @get("/users")
  @querystring({
      age: { type: 'int', required: true, max: 200, convertType: 'int' },
      name: { required: true, max: 20}
  })
	public async list(ctx: Koa.Context){
	    //ctx.body = {
	    //	ok: 1,
	    //	data: user
	    //}
	    const users = await model.findAll()
	    ctx.body = {
	    	ok: 1,
	    	data: users,
	    }
	}
	@post("/users",{
		middlewares: [
			async function validation(ctx,next: ()=> Promise<any>){
				const age = ctx.request.body.age;
				if(!age){
					throw "请输入年龄！"
				}

				try {
				    await api.age(age)
				    await next()
				} catch (err) {
						throw err
				}
				
			}
		]
	})
	public add(ctx: Koa.Context){
      user.push(ctx.request.body)
      ctx.body = {
          ok: 1
      }
	}
}