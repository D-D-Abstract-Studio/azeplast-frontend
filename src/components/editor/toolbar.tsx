const HEADINGS = ['Heading 1', 'Heading 2', 'Heading 3', 'Heading 4', 'Heading 5', 'Heading 6']

export const formats = [
  'align',
  'background',
  'blockquote',
  'bold',
  'bullet',
  'code',
  'code-block',
  'color',
  'direction',
  'font',
  'formula',
  'header',
  'image',
  'indent',
  'italic',
  'link',
  'list',
  'script',
  'size',
  'strike',
  'table',
  'underline',
  'video',
]

export const Toolbar = ({ children }: React.PropsWithChildren<{}>) => {
  return (
    <div className="ql-formats">
      <select className="ql-header" defaultValue="">
        {HEADINGS.map((heading, index) => (
          <option key={heading} value={index + 1}>
            {heading}
          </option>
        ))}
        <option value="">Normal</option>
      </select>

      <button type="button" className="ql-bold" />
      <button type="button" className="ql-italic" />
      <button type="button" className="ql-underline" />
      <button type="button" className="ql-strike" />

      <button type="button" className="ql-list" value="ordered" />
      <button type="button" className="ql-list" value="bullet" />

      <button type="button" className="ql-direction" value="rtl" />
      <select className="ql-align" />

      <button type="button" className="ql-link" />

      {children}

      <button type="button" className="ql-clean" />
    </div>
  )
}
