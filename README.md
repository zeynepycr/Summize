# Summize
Functional Programming SaaS Project

DESCRIPTION

This project is a web application that provides text summarization services using two different models: BART (Abstractive) and Sumy (Extractive).
The application is built using Flask for the backend and includes a user-friendly interface for inputting text and receiving summaries.

Requirements
To run this project, you need the following:

-Python 3.x
-Flask
-Transformers library (for BART model)
-Sumy library (for extractive summarization)
-Flask-Limiter (for rate limiting)
-PyTorch (for model inference)

Installation
-Clone the repository to your local machine:
[CODE]
    git clone <repository-url>
    cd <repository-directory>
[CODE]

Create a virtual environment (optional but recommended):
[CODE]
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
[CODE]

Install the required packages:
[CODE]
    pip install Flask transformers sumy flask-limiter torch
[CODE]

Running the Application
Navigate to the project directory where app.py is located.
Run the application using the following command:
[CODE]
    python app.py
[CODE]

Open your web browser and go to:
[CODE]
    http://127.0.0.1:5000/
[CODE]

Using the Application
-Enter a title for the summary (optional).
-Paste or type the text you want to summarize in the provided text area.
-Select the summarization model and desired summary length.
-Click the "Summarize Text" button to generate the summary.
-You can add the summary to the notebook and download it as a .doc file.

FUNCTIONAL PROGRAMMING ASPECTS

This project incorporates several principles of functional programming:

1.)Pure Functions:
Functions like summarize_with_sumy are pure, meaning they do not have side effects and always return the same output for the same input.

2.)Higher-Order Functions:
JavaScript event handlers are defined as functions that can be passed around and invoked in response to events, treating functions as first-class citizens.

3.)Immutability:
The notebook summaries are managed as an immutable array in the JavaScript code.
Each operation that modifies the notebook creates a new array, adhering to functional programming principles.

4.)Separation of Concerns:
The code is organized into small, reusable functions that handle specific tasks, making it easier to test and maintain.

5.)Avoiding Side Effects:
Functions like log_request are designed to log messages without modifying any external state, which is a key aspect of functional programming.

CONCLUSION
This project demonstrates the application of functional programming principles in a practical web application context, providing a clean and maintainable codebase while delivering a useful service.

