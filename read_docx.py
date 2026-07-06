import zipfile
import xml.etree.ElementTree as ET
import sys

def read_docx(path):
    try:
        with zipfile.ZipFile(path) as docx:
            xml_content = docx.read('word/document.xml')
            tree = ET.XML(xml_content)
            
            # The namespace for Word XML
            namespace = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            text = []
            for paragraph in tree.findall('.//w:p', namespace):
                texts = [node.text for node in paragraph.findall('.//w:t', namespace) if node.text]
                if texts:
                    text.append(''.join(texts))
                else:
                    text.append('') # empty line for paragraph
            
            return '\n'.join(text)
    except Exception as e:
        return str(e)

if __name__ == '__main__':
    if len(sys.argv) > 1:
        print(read_docx(sys.argv[1]))
    else:
        print("Usage: python read_docx.py <path_to_docx>")
