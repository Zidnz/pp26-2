"""Abre cada .docx en LibreOffice (UNO), actualiza el índice y los campos, y guarda el .docx y un .pdf de control.
Uso: soffice --headless --accept="socket,host=localhost,port=2002;urp;" &  y luego  python3 actualizar_indice.py a.docx b.docx ...
"""
import sys, os, time, uno
from com.sun.star.beans import PropertyValue

def prop(n, v):
    p = PropertyValue(); p.Name = n; p.Value = v; return p

local = uno.getComponentContext()
res = local.ServiceManager.createInstanceWithContext('com.sun.star.bridge.UnoUrlResolver', local)
for _ in range(40):
    try:
        ctx = res.resolve('uno:socket,host=localhost,port=2002;urp;StarOffice.ComponentContext'); break
    except Exception:
        time.sleep(0.5)
desk = ctx.ServiceManager.createInstanceWithContext('com.sun.star.frame.Desktop', ctx)
for f in sys.argv[1:]:
    url = uno.systemPathToFileUrl(os.path.abspath(f))
    doc = desk.loadComponentFromURL(url, '_blank', 0, (prop('Hidden', True),))
    idx = doc.getDocumentIndexes()
    for i in range(idx.getCount()):
        idx.getByIndex(i).update()
    doc.getTextFields().refresh()
    doc.refresh()
    doc.storeToURL(url, (prop('FilterName', 'MS Word 2007 XML'),))
    doc.storeToURL(uno.systemPathToFileUrl(os.path.abspath(f[:-5] + '.pdf')), (prop('FilterName', 'writer_pdf_Export'),))
    n = idx.getCount()
    doc.close(True)
    print('ok', f, n, 'índices')
