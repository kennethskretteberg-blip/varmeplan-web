import PDFKit; import AppKit
let a = CommandLine.arguments; let doc = PDFDocument(url: URL(fileURLWithPath: a[1]))!
let page = doc.page(at: Int(a[2])! - 1)!; let r = page.bounds(for: .mediaBox); let s: CGFloat = 2
let topMm = CGFloat(Double(a[4])!); let hPt = topMm / 25.4 * 72
let W = Int(r.width*s), H = Int(hPt*s)
let cs = CGColorSpaceCreateDeviceRGB(); let ctx = CGContext(data: nil, width: W, height: H, bitsPerComponent: 8, bytesPerRow: 0, space: cs, bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
ctx.setFillColor(CGColor(red:1,green:1,blue:1,alpha:1)); ctx.fill(CGRect(x:0,y:0,width:W,height:H))
ctx.scaleBy(x: s, y: s); ctx.translateBy(x: 0, y: hPt - r.height); page.draw(with: .mediaBox, to: ctx)
let rep = NSBitmapImageRep(cgImage: ctx.makeImage()!); try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: a[3]))
