const Progress = require("progress")
const {request, requestImage, createDir, writeFile} = require("./utils/index.js")

const root = process.cwd()
// 分页信息ID
let maxnum = 1233446810
// 每次抓取的图片信息数组
let imagesinfo = []
// 请求的url
let targetURL = ''
// 图片总数
let totalcount = 0

// 分页页面 获取图片URL信息
const startCapture = (maxnum)=>{
        targetURL = `http://huaban.com/explore/guzhuangmeinv/?max=${maxnum}&limit=20&wfl=1`
        console.log(`\u001b[32m ${targetURL}`)
        startTime = Date.now()
        request(targetURL).then((html)=>{
            // 获取存储图片的数组部分
            let app_page = html.match('app.page\\["pins"\\](.*?)];')[0]
            // 提取Json格式数据
            let files_str = app_page.match('\\[{"(.*?)}\\];')[0]
            files_str = files_str.substring(0,files_str.length-1)
            // 存储
            let files = JSON.parse(files_str)
            
            files.forEach(el => {
                // 单个图片信息
                let image_info = {}
                image_info.pin_id = el.pin_id
                image_info.url = `http://img.hb.aicdn.com/${el.file.key}` 
                image_info.title = `${el.raw_text}-${el.pin_id}`
                // image_info.title = image_info.title.replace(/http:\/\//g,'')
                image_info.title = image_info.title.replace(/[\s\W(http:\/\/)]/g,'').substr(0,10)
                // image_info.title = image_info.title.replace(/[^[\u4e00-\u9fa5]\d]/g,'')
                imagesinfo.push(image_info)
            })
            // writeFile(`${__dirname}/images.json`, imagesinfo)
            getmeizi(imagesinfo)
        })
}

// 下载图片
const getmeizi= (imgs) => {
    
    const path = __dirname + '/images'
    
    const total = imgs.length
	const bar = new Progress(" :bar :percent", {
		total: total,
		width: 50
    })

    maxnum = imgs[imgs.length - 1].pin_id

    const complete = (bar) => {
		bar.tick()
		totalcount++
		if (bar.complete) {
            const endTime = Date.now()
            console.log()
			console.log(`\u001b[36m 本次抓取结束共耗时 ${(endTime - startTime) / 1000}s`)
			console.log('\033[91m 已捕捉'+totalcount+'只妹子~')
			// 继续下一波捕捉~
            startCapture(maxnum)
		}
	}

    while(imgs.length){
        const image = imgs.shift()
        requestImage(image,path).then((filename) => {
            complete(bar)
		}).catch((error) => {
			throw error
		})
    }
}

Promise.all([createDir(`${root}/images`)]).then(() => {
	startCapture(maxnum)
})