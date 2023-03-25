Page({
  // 设置初始数据，包括GIF图片地址和MP3文件列表
  data: {
    gifUrl: '../../images/giphy.gif',
    isPlaying: false,
    playBtnClassName: '',
    audioList: [{
      id: '',
      url: ''
    }],
    audioIndex: 0 // 当前播放的音频索引
  },
  onLoad: function () {
    // 定义全局的播放器实例
    var that = this
    this.innerAudioContext = wx.createInnerAudioContext();


    wx.cloud.callFunction({
      name: 'GetMusic',
      data: {
        folder: 'mp3' // 云存储中的 mp3 文件路径列表
      },
      success(res) {
        const fileList = res.result.data
        // console.log('文件列表: ', fileList)
        let tempAudioList = []
        for (let i = 0; i < fileList.length; i++) {
          let file = fileList[i]
          tempAudioList.push({
            id: i.toString(),
            url: file.tempFileURL
          })
        }
        that.setData({
          audioList: tempAudioList
        })
        // 监听音频播放结束事件，自动播放下一首音频
        that.innerAudioContext.onEnded(function () {
          if (that.data.audioIndex < tempAudioList.length - 1) {
            that.setData({
              audioIndex: that.data.audioIndex + 1
            })
            that.innerAudioContext.src = tempAudioList[that.data.audioIndex].url
            that.innerAudioContext.play()
          }

        })
        // 处理获取到的文件列表
      },
      fail(err) {
        console.error('调用云函数失败：', err)
      }
    })
  },
  // 点击播放按钮触发的事件处理函数
  playAudio: function (event) {
    var that = this
    if (that.data.isPlaying) {
      this.innerAudioContext.pause()
      that.setData({
        isPlaying: false,
        playBtnClassName: ''
      })
    } else {
      this.innerAudioContext.src = that.data.audioList[that.data.audioIndex].url
      this.innerAudioContext.play()
      that.setData({
        isPlaying: true,
        playBtnClassName: 'stopPlaying'
      })
    }
  }
})