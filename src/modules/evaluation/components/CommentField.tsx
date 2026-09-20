export default function CommentField({ valor, onChange }: { valor: string; onChange: (t: string) => void }) {
  return (
    <div>
      <label htmlFor="comentario" className="block text-sm font-medium mb-1">Comentário <span className="text-gray-500 font-normal">(opcional)</span></label>
      <textarea
        id="comentario"
        rows={3}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-accent/40 focus:outline-none focus:ring-2 focus:ring-primary/40 p-3 text-sm"
      />
    </div>
  )
}
