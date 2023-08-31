export default function Header() {
  return (
    <header className="flex items-center justify-between gap-4 p-4">
      <a href="/">
        <h1 className="font-semibold">
          Free<span className="text-orange-400 bold">Scribe</span>
        </h1>
      </a>
      <a
        href="/"
        className="flex items-center gap-2 specialButton p-2 px-3 text-sm rounded-lg text-orange-400 cursor-pointer"
      >
        <p>New</p>
        <i className="fa-solid fa-plus"></i>
      </a>
    </header>
  )
}
