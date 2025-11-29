from PIL import Image
from pdf2image import convert_from_bytes
import io

class ImageProcessor:
    def process_file(self, file_content: bytes, filename: str) -> Image.Image:
        """
        Processes the input file content (PDF or Image) and returns a PIL Image.
        """
        if filename.lower().endswith('.pdf'):
            return self._process_pdf(file_content)
        else:
            return self._process_image(file_content)

    def _process_pdf(self, file_content: bytes) -> Image.Image:
        """
        Converts all pages of a PDF to images and stitches them vertically.
        """
        try:
            images = convert_from_bytes(file_content)
            if not images:
                raise ValueError("Could not convert PDF to image.")
            
            if len(images) == 1:
                return images[0]

            # Stitch images vertically
            total_width = max(img.width for img in images)
            total_height = sum(img.height for img in images)
            
            stitched_image = Image.new('RGB', (total_width, total_height), (255, 255, 255))
            
            y_offset = 0
            for img in images:
                # Center the image if widths differ (unlikely for standard PDFs but good practice)
                x_offset = (total_width - img.width) // 2
                stitched_image.paste(img, (x_offset, y_offset))
                y_offset += img.height
                
            return stitched_image
            
        except Exception as e:
            raise ValueError(f"PDF processing failed: {str(e)}")

    def _process_image(self, file_content: bytes) -> Image.Image:
        """
        Opens an image from bytes.
        """
        try:
            image = Image.open(io.BytesIO(file_content))
            return image
        except Exception as e:
            raise ValueError(f"Image processing failed: {str(e)}")

image_processor = ImageProcessor()
