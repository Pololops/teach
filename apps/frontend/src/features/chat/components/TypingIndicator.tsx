export function TypingIndicator() {
  return (
    <div className="flex w-full mb-4 justify-start">
      <div className="max-w-[70%] rounded-lg px-4 py-2 bg-muted text-foreground">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce"></div>
          </div>
          <span className="text-xs text-foreground/70">...</span>
        </div>
      </div>
    </div>
  );
}
