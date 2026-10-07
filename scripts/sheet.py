import sys
from PIL import Image, ImageDraw
files=sys.argv[2:]; out=sys.argv[1]
W,H=960,540; cols=2; rows=(len(files)+cols-1)//cols
sheet=Image.new('RGB',(W*cols,H*rows),'#222')
for i,f in enumerate(files):
    im=Image.open(f).convert('RGB').resize((W,H),Image.LANCZOS)
    d=ImageDraw.Draw(im); d.rectangle((0,0,110,30),fill='black'); d.text((6,6),f,fill='yellow')
    sheet.paste(im,((i%cols)*W,(i//cols)*H))
sheet.save(out)
