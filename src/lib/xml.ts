import { toXML as toXMLImpl, XmlElement, XmlOptions } from 'jstoxml';

// wrap the toXML method to put in some default options
export function toXML(obj?: XmlElement | XmlElement[], options?: XmlOptions) {
  return toXMLImpl(obj, { ...options, depth: 100, indent: '' });
}
