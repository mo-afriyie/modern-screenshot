import type { Context } from '../context'
import type { Options } from '../options'
import { orCreateContext } from '../create-context'
import { domToForeignObjectSvg } from './dom-to-foreign-object-svg'

export async function domToHtml<T extends Node>(
  node: T,
  options?: Options
): Promise<string>
export async function domToHtml<T extends Node>(
  context: Context<T>
): Promise<string>
export async function domToHtml(node: any, options?: any): Promise<string> {
  // Default to not embedding images for HTML export to keep it clean and smaller
  const htmlOptions = { embedImages: false, ...options }
  const context = await orCreateContext(node, htmlOptions)

  const svg = await domToForeignObjectSvg(context)
  const foreignObject = svg.querySelector('foreignObject')

  if (foreignObject && foreignObject.firstChild) {
    const serializer = new XMLSerializer()
    let html = serializer.serializeToString(foreignObject.firstChild)

    html = html.replace(/\s+xmlns="[^"]*"/g, '')

    return html
  }

  return ''
}
