/** 静态资产完整性测试：扫描前端代码引用并确认所有图片均存在于本地。 */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..","frontend");
const sourceFiles=[];
/** 递归收集可能包含图片引用的 HTML/CSS/JS 源文件。 */
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())walk(full);else if(/\.(html|css|js)$/.test(entry.name))sourceFiles.push(full)}}
walk(root);
const refs=[];
for(const file of sourceFiles){const text=fs.readFileSync(file,"utf8");for(const match of text.matchAll(/(?:url\(['"]?|["'])(\.\.\/)?assets\/images\/[^)'"\s]+/g)){let ref=match[0].replace(/^url\(['"]?|^["']/,'').replace(/^\.\.\//,'');refs.push({file,ref})}}
for(const {file,ref} of refs){const clean=ref.replace(/["')]$/g,"");const target=path.resolve(path.dirname(file),ref.startsWith("assets/")?path.relative(path.dirname(file),path.join(root,clean)):clean);assert.ok(fs.existsSync(target),`Missing asset ${clean} referenced by ${path.relative(root,file)}`)}
const images=[];walkImages(path.join(root,"assets","images"));
/** 递归收集实际存在的 PNG/JPEG，用于防止素材目录意外缺失。 */
function walkImages(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())walkImages(full);else if(/\.(png|jpe?g)$/i.test(entry.name))images.push(full)}}
assert.ok(images.length>=43,`Expected at least 43 local images, found ${images.length}`);
console.log(`✓ ${refs.length} 个代码图片引用存在，${images.length} 个本地图片资产可用`);
