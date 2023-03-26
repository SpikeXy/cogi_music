// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
}) // 使用当前云环境

const db = cloud.database()

function findDifference(str1, str2) {
  const len = Math.max(str1.length, str2.length)
  let diffIndex = -1
  for (let i = 0; i < len; i++) {
    if (str1[i] !== str2[i]) {
      diffIndex = i
      break
    }
  }
  return diffIndex
}
function trim(str) {
  return str.replace(/\s/g, '').replace(/undefined/g, '');
}

exports.main = async (event, context) => {
  let fileList = [];
  let folder = event.folder;
  let skip = event.skip;
  let limit = event.limit;
  try {
    // 获取指定目录下所有文件信息
    const {
      data: fileInfoList
    } = await db.collection(folder)
      .skip(skip).limit(limit).get().then(res => {
        return res;
      })
     // console.log(fileInfoList)
    for (let i = 0; i < fileInfoList.length; i++) {
      const fileInfo = fileInfoList[i]
      const {
        fileList: [file]
      } = await cloud.getTempFileURL({
        fileList: [fileInfo.fileID.trim()],
      })
      fileList.push({
        fileID: fileInfo.fileID,
        // fileName: fileInfo.fileName,
        // fileType: fileInfo.fileType,
        tempFileURL: file.tempFileURL
      })
    }
    //console.log(fileList)
    return {
      code: 0,
      data: fileList
    }
  } catch (err) {
    return {
      code: 1,
      errMsg: err.message
    }
  }
}