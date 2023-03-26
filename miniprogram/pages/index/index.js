Page({
  // 设置初始数据，包括GIF图片地址和MP3文件列表
  data: {
    gifUrl: '../../images/giphy.gif',
    isPlaying: false,
    intervalId: null,
    count: 0,
    countMax: 30,
    playBtnClassName: '',
    description: '工作学习背景纯音乐',
    audioList: [],
    audioIndex: 0 // 当前播放的音频索引
  },
  GetMyMusic: function (skip, limit) {
    if (this.data.audioList.length >= 2) {
      return;
    }
    var that = this;
    wx.cloud.callFunction({
      name: 'GetMusic',
      data: {
        folder: 'mp3',
        skip: skip,
        limit: limit,
      },
      success(res) {
        const fileList = res.result.data
        //console.log(fileList)
        // console.log('文件列表: ', fileList)
        let tempAudioList = that.data.audioList

        for (let i = 0; i < fileList.length; i++) {
          let file = fileList[i]
          let newid = that.data.audioList.length + i;
          tempAudioList.push({
            id: newid.toString(),
            url: file.tempFileURL
          })
        }

        that.setData({
          audioList: tempAudioList
        })
      },
      fail(err) {
        console.error('调用云函数失败：', err)
      }
    })
  },
  startInterval: function () {
    const intervalId = setInterval(() => {
      this.GetMyMusic(this.data.audioList.length, 1)
      this.setData({
        count: this.data.count + 1
      });
      if (this.data.count >= this.data.countMax) {
        clearInterval(this.data.intervalId);
      }
    }, 3000);
    this.setData({
      intervalId: intervalId
    });
  },
  stopInterval: function () {
    clearInterval(this.data.intervalId);
    this.setData({
      count: 0,
      intervalId: null
    });
  },
  onLoad: function () {
    // 定义全局的播放器实例
    var that = this
    this.innerAudioContext = wx.createInnerAudioContext();
    // 监听音频播放结束事件，自动播放下一首音频
    this.innerAudioContext.onEnded(function () {
      if (that.data.audioIndex < that.data.audioList.length - 1) {
        that.setData({
          audioIndex: that.data.audioIndex + 1
        })
      } else {
        //重新从0开始
        that.setData({
          audioIndex: 0
        })
      }
      that.innerAudioContext.src = that.data.audioList[that.data.audioIndex].url
      that.innerAudioContext.play()
    })

    // 定义定时任务
    this.startInterval();
    this.GetMyMusic(this.data.audioList.length, 1)
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