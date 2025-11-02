
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import '../../styles/markdown.css'

export default function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}
