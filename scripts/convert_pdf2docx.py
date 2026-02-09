import sys
from pdf2docx import Converter

def main():
    if len(sys.argv) != 3:
        print("Uso: convert_pdf2docx.py input.pdf output.docx")
        sys.exit(1)

    input_pdf = sys.argv[1]
    output_docx = sys.argv[2]

    try:
        cv = Converter(input_pdf)
        cv.convert(output_docx, start=0, end=None)
        cv.close()
    except Exception as e:
        print(f"Erro na conversão: {e}")
        sys.exit(2)

if __name__ == "__main__":
    main()
