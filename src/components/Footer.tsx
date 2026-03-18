export default function Footer() {
  return (
    <footer className="mt-16 bg-[#003399] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#FFFF00] text-[#003399] font-black text-lg w-9 h-9 rounded flex items-center justify-center select-none">
              SW
            </div>
            <div>
              <p className="font-bold">Sheffield Wednesday News</p>
              <p className="text-blue-200 text-xs">Your home for the latest Owls updates</p>
            </div>
          </div>
          <p className="text-blue-200 text-sm">Up the Owls! 🦉</p>
        </div>
      </div>
    </footer>
  );
}