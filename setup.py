from setuptools import setup, find_packages

setup(
    name="kyc-extractor-ai",
    version="0.1.0",
    description="AI-powered KYC Document Extraction using Google Gemini",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    author="Arvind",
    author_email="your.email@example.com",
    url="https://github.com/arvi1999/kyc-extractor-ai",
    packages=find_packages(),
    install_requires=[
        "fastapi==0.109.0",
        "uvicorn==0.27.0",
        "python-multipart==0.0.6",
        "google-generativeai==0.3.2",
        "pillow==10.2.0",
        "pdf2image==1.17.0",
        "python-dotenv==1.0.1",
    ],
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires='>=3.10',
)
