import { useState, useEffect, useRef } from "react"
export default function HomePage({ setFile, setAudioStream }: any) {
  const [recordingStatus, setRecordingStatus] = useState("inactive")
  const [audioChunks, setAudioChunks] = useState([])
  const [duration, setDuration] = useState(0)

  const mediaRecorder = useRef<any>(null)
  const mimeType: string = "audio/webm"

  async function startRecording() {
    let tempStream

    console.log("Start recording")

    try {
      const streamData: any = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      })
      tempStream = streamData
    } catch (err: any) {
      console.log(err.message)
      return
    }

    setRecordingStatus("recording")

    //create new media recorder instance using tempStream
    const media = new MediaRecorder(tempStream, {
      mimeType,
    })

    mediaRecorder.current = media

    mediaRecorder.current.start()
    let localAudioChunks: any = []
    mediaRecorder.current.ondataavailable = (event: any) => {
      if (typeof event.data === "undefined") return
      if (event.data.size === 0) return
      localAudioChunks.push(event.data)
    }
    setAudioChunks(localAudioChunks)
  }

  async function stopRecording() {
    setRecordingStatus("inactive")
    console.log("stop recording")

    mediaRecorder.current.stop()
    mediaRecorder.current.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: mimeType })
      setAudioStream(audioBlob)
      setAudioChunks([])
      setDuration(0)
    }
  }

  useEffect(() => {
    if (recordingStatus === "inactive") return
    const interval = setInterval(() => {
      setDuration((curr) => curr + 1)
    }, 1000)
    return () => clearInterval(interval)
  })

  return (
    <main className="flex-1 p-4 flex flex-col gap-3 text-center sm:gap-4 justify-center pb-20">
      <h1 className="font-semibold text-5xl sm:text-6xl md:text-7xl">
        Free<span className="text-orange-400 bold">Scribe</span>
      </h1>
      <h3 className="font-medium md:text-lg flex items-center justify-center gap-x-1">
        Record<span className="text-orange-400 pb-1">&rarr;</span>
        Transcribe<span className="text-orange-400 pb-1">&rarr;</span>
        Translate
      </h3>
      <button
        onClick={
          recordingStatus === "recording" ? stopRecording : startRecording
        }
        className="flex items-center text-base justify-between gap-4 mx-auto w-72 max-w-full my-4 specialButton px-4 py-2 rounded-xl text-orange-400"
      >
        <p>{recordingStatus === "inactive" ? "Record" : `Stop recording`}</p>
        <div className="flex items-center gap-2">
          {duration !== 0 && <p className="text-sm ">{duration}s</p>}
          <i
            className={
              "fa-solid duration-200 fa-microphone " +
              (recordingStatus === "recording" ? "text-rose-500" : "")
            }
          ></i>
        </div>
      </button>
      <p className="text-base">
        Or{" "}
        <label className="text-orange-400 cursor-pointer hover:text-orange-400 duration-200">
          upload
          <input
            className="hidden"
            type="file"
            accept=".mp3,.wav,.wave"
            onChange={(e) => {
              if (!e.target.files) {
                console.log("No files uploaded, returning...")
                return
              }
              const tempFile = e.target.files[0]
              setFile(tempFile)
            }}
          />
        </label>{" "}
        a mp3 or wave file
      </p>
      <p className="italic text-slate-400">Free now free forever</p>
    </main>
  )
}
