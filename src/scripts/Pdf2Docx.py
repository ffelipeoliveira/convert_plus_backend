# pip install pdf2docx

import sys
from pdf2docx import Converter


def pdf2docx(arquivo_pdf, arquivo_docx):
    try:
        cv = Converter(arquivo_pdf)
        cv.convert(arquivo_docx, start=0, end=None)
        cv.close()

        print(f"Conversão concluída: {arquivo_docx}")
        return True

    except Exception as e:
        print(f"Erro na conversão: {e}")
        return False


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Uso: python pdf_to_docx.py entrada.pdf saida.docx")
        sys.exit(1)

    arquivo_pdf = sys.argv[1]
    arquivo_docx = sys.argv[2]

    sucesso = pdf2docx(arquivo_pdf, arquivo_docx)

    sys.exit(0 if sucesso else 1)
