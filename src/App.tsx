import { useRef, useState, useEffect } from "react"
import HomePage from "./components/HomePage"
import Header from "./components/Header"
import FileDisplay from "./components/FileDisplay"
import Information from "./components/Information"
import Transcribing from "./components/Transcribing"
import { MessageTypes } from "./utils/presets"

function App() {
  const [file, setFile] = useState(null)
  const [audioStream, setAudioStream] = useState(null)
  const [output, setOutput] = useState(null)
  const [loading, setLoading] = useState(false)

  // start setting up transcription stuff
  const [finished, setFinished] = useState(false)
  const [_downloading, setDownloading] = useState(false)

  const isAudioAvailable = file || audioStream

  function handleAudioReset() {
    setFile(null)
    setAudioStream(null)
  }

  const worker: any = useRef(null)

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(
        new URL("./utils/whisper.worker.ts", import.meta.url),
        {
          type: "module",
        }
      )
    }

    const onMessageReceived = async (e: any) => {
      switch (e.data.type) {
        case "DOWNLOADING":
          setDownloading(true)
          console.log("DOWNLOADING")
          break
        case "LOADING":
          setLoading(true)
          console.log("LOADING")
          break
        case "RESULT":
          setOutput(e.data.results)
          console.log(e.data.results)
          break
        case "INFERENCE_DONE":
          setFinished(true)
          console.log("DONE")
          break
      }
    }

    worker.current.addEventListener("message", onMessageReceived)

    return () =>
      worker.current.removeEventListener("message", onMessageReceived)
  })

  async function readAudioFrom(file: any) {
    const sampling_rate = 16000
    const audioCTX = new AudioContext({ sampleRate: sampling_rate })
    const response = await file.arrayBuffer()
    const decoded = await audioCTX.decodeAudioData(response)
    const audio = decoded.getChannelData(0)
    return audio
  }

  async function handleFormSubmission() {
    if (!file && !audioStream) return

    let audio = await readAudioFrom(file ? file : audioStream)
    const model_name = `openai/whisper-tiny.en`

    worker.current.postMessage({
      type: MessageTypes.INFERENCE_REQUEST,
      audio,
      model_name,
    })
  }

  return (
    <div className="flex flex-col max-w-[1000px] mx-auto w-full">
      <section className="min-h-screen flex flex-col">
        <Header />
        {output ? (
          <Information output={output} finished={finished} />
        ) : loading ? (
          <Transcribing />
        ) : isAudioAvailable ? (
          <FileDisplay
            handleFormSubmission={handleFormSubmission}
            handleAudioReset={handleAudioReset}
            file={file}
            audioStream={audioStream}
          />
        ) : (
          <HomePage setFile={setFile} setAudioStream={setAudioStream} />
        )}
      </section>
      <footer></footer>
    </div>
  )
}

export default App
