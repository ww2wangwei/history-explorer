/**
 * scripts/add-poem-coords.mjs
 *
 * 给 100 首唐诗宋词批量加上 geoLocation（创作地 / 诗中场景地 + 简短 label）
 * 直接编辑 src/data/poems.json
 */
import fs from 'node:fs'

const POEMS_PATH = 'src/data/poems.json'

// 标签 → [lng, lat, label]
const COORDS = {
  // ---- 唐诗 60 ----
  'poem-tang-001': { ll: [119.43, 32.39], label: '扬州（今江苏）' },           // 静夜思 旅居扬州
  'poem-tang-002': { ll: [115.97, 29.55], label: '庐山（江西九江南）' },        // 望庐山瀑布
  'poem-tang-003': { ll: [109.43, 31.02], label: '白帝城（重庆奉节）' },        // 早发白帝城
  'poem-tang-004': { ll: [114.31, 30.55], label: '黄鹤楼（武汉）' },              // 黄鹤楼送
  'poem-tang-005': { ll: [108.95, 34.27], label: '长安（今西安）' },              // 将进酒
  'poem-tang-006': { ll: [108.95, 34.27], label: '长安' },                       // 行路难
  'poem-tang-007': { ll: [119.00, 30.99], label: '宣州（今安徽宣城）' },         // 宣州谢朓楼
  'poem-tang-008': { ll: [108.95, 34.27], label: '长安' },                       // 月下独酌
  'poem-tang-009': { ll: [107.02, 33.07], label: '蜀道（汉中秦岭段）' },         // 蜀道难
  'poem-tang-010': { ll: [119.43, 32.39], label: '扬州（李白寄友）' },           // 闻王昌龄
  'poem-tang-011': { ll: [108.95, 34.27], label: '长安（被叛军占领）' },         // 春望
  'poem-tang-012': { ll: [109.43, 31.02], label: '夔州（重庆奉节）' },           // 登高
  'poem-tang-013': { ll: [117.10, 36.25], label: '泰山（山东泰安）' },            // 望岳
  'poem-tang-014': { ll: [104.07, 30.57], label: '成都武侯祠' },                  // 蜀相
  'poem-tang-015': { ll: [104.07, 30.57], label: '成都浣花溪畔' },                // 江畔独步
  'poem-tang-016': { ll: [104.07, 30.57], label: '成都草堂' },                    // 绝句
  'poem-tang-017': { ll: [104.74, 31.46], label: '梓州（四川绵阳）' },            // 闻官军收复
  'poem-tang-018': { ll: [109.33, 35.99], label: '鄜州（陕西富县）' },            // 月夜
  'poem-tang-019': { ll: [104.07, 30.57], label: '成都草堂' },                    // 茅屋秋风
  'poem-tang-020': { ll: [109.43, 31.02], label: '夔州（重庆奉节）' },            // 秋兴八首
  'poem-tang-021': { ll: [109.31, 34.15], label: '辋川（陕西蓝田）' },            // 山居秋暝
  'poem-tang-022': { ll: [108.70, 34.40], label: '渭城（咸阳北）' },              // 送元二
  'poem-tang-023': { ll: [108.95, 34.27], label: '长安' },                          // 九月九日忆兄弟
  'poem-tang-024': { ll: [101.07, 41.97], label: '居延塞 / 河西' },               // 使至塞上
  'poem-tang-025': { ll: [109.31, 34.15], label: '辋川' },                        // 竹里馆
  'poem-tang-026': { ll: [108.95, 34.27], label: '长安' },                          // 赋得古原草
  'poem-tang-027': { ll: [120.13, 30.27], label: '杭州西湖' },                     // 钱塘湖春行
  'poem-tang-028': { ll: [115.97, 29.55], label: '庐山大林寺' },                  // 大林寺桃花
  'poem-tang-029': { ll: [116.00, 29.71], label: '浔阳江（九江）' },              // 琵琶行
  'poem-tang-030': { ll: [109.10, 34.36], label: '华清宫（西安临潼）' },          // 长恨歌
  'poem-tang-031': { ll: [100.46, 40.94], label: '边塞 · 凉州一带' },               // 出塞
  'poem-tang-032': { ll: [119.42, 32.20], label: '芙蓉楼（江苏镇江）' },           // 芙蓉楼
  'poem-tang-033': { ll: [112.13, 31.87], label: '襄阳鹿门山' },                  // 春晓
  'poem-tang-034': { ll: [112.13, 31.87], label: '襄阳' },                          // 过故人庄
  'poem-tang-035': { ll: [108.95, 34.27], label: '长安 · 作者籍贯怀州' },         // 锦瑟（李商隐）
  'poem-tang-036': { ll: [108.95, 34.27], label: '长安' },                          // 无题
  'poem-tang-037': { ll: [108.04, 30.30], label: '忠州（重庆忠县）' },            // 夜雨寄北
  'poem-tang-038': { ll: [108.95, 34.27], label: '长安乐游原' },                    // 登乐游原
  'poem-tang-039': { ll: [118.79, 32.10], label: '江南' },                          // 江南春
  'poem-tang-040': { ll: [118.79, 32.10], label: '秦淮河（南京）' },                // 泊秦淮
  'poem-tang-041': { ll: [118.79, 32.10], label: '南京一带' },                      // 清明
  'poem-tang-042': { ll: [118.79, 32.10], label: '南京乌衣巷' },                    // 乌衣巷
  'poem-tang-043': { ll: [118.36, 31.71], label: '和州（安徽和县）' },              // 陋室铭
  'poem-tang-044': { ll: [120.27, 30.17], label: '永兴（杭州萧山）' },              // 回乡偶书
  'poem-tang-045': { ll: [113.10, 41.40], label: '幽州北 · 燕歌' },                  // 燕歌行
  'poem-tang-046': { ll: [87.31, 44.01], label: '轮台（昌吉附近）' },              // 白雪歌
  'poem-tang-047': { ll: [108.95, 34.27], label: '长安 → 蜀州' },                    // 送杜少府
  'poem-tang-048': { ll: [112.96, 39.04], label: '雁门关（山西代县）' },           // 雁门太守行
  'poem-tang-049': { ll: [108.95, 34.27], label: '长安' },                            // 李凭箜篌引
  'poem-tang-050': { ll: [108.95, 34.27], label: '长安' },                            // 望江南
  'poem-tang-051': { ll: [108.95, 34.27], label: '长安' },                            // 离思
  'poem-tang-052': { ll: [112.10, 31.04], label: '荆门（湖北）' },                    // 望月怀远
  'poem-tang-053': { ll: [120.62, 31.30], label: '苏州寒山寺' },                     // 枫桥夜泊
  'poem-tang-054': { ll: [120.74, 31.65], label: '常熟兴福寺（破山寺）' },           // 题破山寺
  'poem-tang-055': { ll: [114.31, 30.55], label: '黄鹤楼（武汉）' },                // 黄鹤楼
  'poem-tang-056': { ll: [111.61, 26.42], label: '永州（湖南）' },                  // 江雪
  'poem-tang-057': { ll: [116.40, 39.92], label: '幽州蓟北（北京）' },               // 登幽州台歌
  'poem-tang-058': { ll: [120.08, 29.31], label: '义乌乌伤（童年故里）' },           // 咏鹅
  'poem-tang-059': { ll: [110.27, 34.86], label: '永济鹳雀楼（山西）' },           // 登鹳雀楼
  'poem-tang-060': { ll: [102.63, 37.93], label: '凉州（甘肃武威）' },              // 凉州词

  // ---- 宋词 40 ----
  'poem-song-001': { ll: [119.41, 35.99], label: '密州（山东诸城）' },             // 水调歌头
  'poem-song-002': { ll: [114.87, 30.45], label: '黄州（湖北黄冈）' },             // 赤壁怀古
  'poem-song-003': { ll: [119.41, 35.99], label: '密州' },                          // 密州出猎
  'poem-song-004': { ll: [119.41, 35.99], label: '密州' },                          // 乙卯
  'poem-song-005': { ll: [114.87, 30.45], label: '黄州沙湖道中' },                  // 定风波
  'poem-song-006': { ll: [114.42, 23.11], label: '惠州（广东）' },                  // 蝶恋花春景
  'poem-song-007': { ll: [117.13, 36.65], label: '家乡（济南·少女时期）' },         // 如梦令
  'poem-song-008': { ll: [119.65, 29.12], label: '金华' },                           // 声声慢
  'poem-song-009': { ll: [120.62, 31.30], label: '苏州' },                            // 一剪梅
  'poem-song-010': { ll: [118.05, 31.62], label: '乌江（项羽自刎处）' },             // 夏日绝句
  'poem-song-011': { ll: [120.16, 30.27], label: '临安（杭州）' },                  // 青玉案
  'poem-song-012': { ll: [117.94, 28.46], label: '信州（上饶）' },                  // 破阵子
  'poem-song-013': { ll: [119.42, 32.20], label: '京口（镇江）北固亭' },            // 永遇乐
  'poem-song-014': { ll: [117.94, 28.46], label: '黄沙岭（上饶境内）' },            // 西江月
  'poem-song-015': { ll: [117.94, 28.46], label: '上饶农村' },                       // 村居
  'poem-song-016': { ll: [114.31, 34.79], label: '汴京（开封）长亭' },              // 雨霖铃
  'poem-song-017': { ll: [114.31, 34.79], label: '汴京' },                            // 蝶恋花
  'poem-song-018': { ll: [120.16, 30.27], label: '杭州' },                            // 望海潮
  'poem-song-019': { ll: [120.59, 29.99], label: '山阴（绍兴）' },                  // 示儿
  'poem-song-020': { ll: [120.59, 29.99], label: '绍兴沈园' },                       // 钗头凤
  'poem-song-021': { ll: [120.59, 29.99], label: '绍兴' },                            // 咏梅
  'poem-song-022': { ll: [119.43, 32.39], label: '扬州' },                            // 扬州慢
  'poem-song-023': { ll: [109.49, 36.59], label: '延州（陕西延安）' },              // 渔家傲
  'poem-song-024': { ll: [118.79, 32.10], label: '江南庭院' },                       // 庭院深深
  'poem-song-025': { ll: [118.79, 32.10], label: '临安' },                            // 元夕
  'poem-song-026': { ll: [119.42, 32.20], label: '瓜洲（江苏扬州南）' },             // 泊船瓜洲
  'poem-song-027': { ll: [118.79, 32.10], label: '南宋 · 京口/金陵' },              // 满江红（宋）
  'poem-song-028': { ll: [120.59, 29.99], label: '郓州（山东东平）' },              // 鹊桥仙
  'poem-song-029': { ll: [120.59, 29.99], label: '会稽（绍兴）' },                  // 满庭芳
  'poem-song-030': { ll: [118.79, 32.10], label: '金陵（南京）囚所' },               // 虞美人
  'poem-song-031': { ll: [118.79, 32.10], label: '金陵囚所' },                       // 相见欢
  'poem-song-032': { ll: [114.31, 34.79], label: '汴京（开封）' },                  // 浣溪沙
  'poem-song-033': { ll: [114.31, 34.79], label: '汴京' },                            // 蝶恋花槛菊
  'poem-song-034': { ll: [120.13, 30.27], label: '杭州净慈寺' },                     // 晓出净慈寺
  'poem-song-035': { ll: [120.59, 29.99], label: '南宋江南' },                       // 游园不值
  'poem-song-036': { ll: [118.79, 32.10], label: '金陵（南京）' },                  // 临江仙
  'poem-song-037': { ll: [114.31, 34.79], label: '汴京' },                            // 兰陵王
  'poem-song-038': { ll: [120.10, 30.87], label: '吴兴（湖州）' },                  // 天仙子
  'poem-song-039': { ll: [117.94, 28.46], label: '信州（上饶）' },                  // 贺新郎
  'poem-song-040': { ll: [114.32, 30.55], label: '湖北' },                            // 摸鱼儿
}

// 写回
const data = JSON.parse(fs.readFileSync(POEMS_PATH, 'utf8'))
let added = 0
for (const poem of data.poems) {
  const c = COORDS[poem.id]
  if (c) {
    poem.geo = c.ll
    poem.geoLabel = c.label
    added++
  }
}
fs.writeFileSync(POEMS_PATH, JSON.stringify(data, null, 2), 'utf8')
console.log(`✓ 已为 ${added} 首诗加 geo / geoLabel`)
console.log(`未指定: ${data.poems.length - added} 首`)
