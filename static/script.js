const btn = document.getElementById('summarizeBtn');
const inputText = document.getElementById('inputText');
const summaryDiv = document.getElementById('summary');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const clearBtn = document.getElementById('clearBtn');
const modelSelect = document.getElementById('modelSelect');
const lengthSelect = document.getElementById('lengthSelect');
const addToNotebookBtn = document.getElementById('addToNotebookBtn');
const downloadNotebookBtn = document.getElementById('downloadNotebookBtn');
const clearNotebookBtn = document.getElementById('clearNotebookBtn');
const notebookDiv = document.getElementById('notebook');
const summaryTitle = document.getElementById('summaryTitle');

    const clearTextAndSummary = () => {
        inputText.value = '';
        summaryDiv.textContent = '';
        errorDiv.textContent = '';
        addToNotebookBtn.disabled = true;
        summaryTitle.value = '';
    }

    const addSummaryToNotebook = () => {
        const currentSummary = summaryDiv.textContent.trim();
        if (!currentSummary) { return; }
        const titleInput = summaryTitle.value.trim();
        const headingText = titleInput || `Summary added on ${new Date().toLocaleString()}`;

        if (notebookDiv.querySelector('em')) {
            notebookDiv.querySelector('em').remove();
        }

        const summaryBlock = document.createElement('div');
        summaryBlock.style.marginBottom = '15px';
        summaryBlock.style.borderBottom = '1px dashed #633974';
        summaryBlock.style.paddingBottom = '10px';

        const heading = document.createElement('h3');
        heading.textContent = headingText;
        heading.style.color = '#9b59b6';
        heading.style.marginBottom = '6px';
        heading.style.fontWeight = '600';

        const para = document.createElement('p');
        para.textContent = currentSummary;
        para.style.whiteSpace = 'pre-wrap';
        para.style.margin = '0';

        summaryBlock.appendChild(heading);
        summaryBlock.appendChild(para);
        notebookDiv.appendChild(summaryBlock);

        downloadNotebookBtn.disabled = false;
        summaryTitle.value = '';
    }

    const downloadNotebookAsDoc = () => {
        let contentHtml = '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' +
            'xmlns:w="urn:schemas-microsoft-com:office:word" ' +
            'xmlns="http://www.w3.org/TR/REC-html40">' +
            '<head><meta charset="utf-8"><title>Notebook Summary Export</title></head><body>';
        contentHtml += '<h1>Notebook Summaries Export</h1>';

        const summaries = notebookDiv.querySelectorAll('div');
        if(summaries.length === 0){
            alert('No summaries to download!');
            return;
        }
        summaries.forEach(div => {
            const h3 = div.querySelector('h3');
            const p = div.querySelector('p');
            if(h3 && p){
                contentHtml += `<h3>${h3.textContent}</h3>`;
                const text = p.textContent.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
                contentHtml += `<p>${text.replace(/\\n/g, '<br>')}</p>`;
            }
        });

        contentHtml += '</body></html>';

        const blob = new Blob(['\ufeff', contentHtml], {
            type: 'application/msword'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'NotebookSummaries.doc';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    const clearNotebook = () => {
        const summaryBlocks = notebookDiv.querySelectorAll('div');
        summaryBlocks.forEach(block => block.remove());
        if (!notebookDiv.querySelector('em')) {
            const placeholder = document.createElement('em');
            placeholder.textContent = 'No summaries added yet.';
            notebookDiv.appendChild(placeholder);
        }
        downloadNotebookBtn.disabled = true;
    }

    clearBtn.addEventListener('click', clearTextAndSummary);

    btn.addEventListener('click', async () => {
        const text = inputText.value.trim();
        const model = modelSelect.value;
        const length = lengthSelect.value;
        errorDiv.textContent = '';
        summaryDiv.textContent = '';

        if(!text) {
            errorDiv.textContent = "Please enter some text to summarize.";
            addToNotebookBtn.disabled = true;
            return;
        }

        btn.disabled = true;
        addToNotebookBtn.disabled = true;
        loadingDiv.style.display = 'block';

        try {
            const response = await fetch('/summarize', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text, model, length })
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                throw new Error(errorResponse.error || response.statusText);
            }

            const data = await response.json();
            summaryDiv.textContent = data.summary;
            addToNotebookBtn.disabled = false;
        } catch (error) {
            errorDiv.textContent = "Error: " + error.message;
            addToNotebookBtn.disabled = true;
        } finally {
            btn.disabled = false;
            loadingDiv.style.display = 'none';
        }
    });

    addToNotebookBtn.addEventListener('click', addSummaryToNotebook);
    downloadNotebookBtn.addEventListener('click', downloadNotebookAsDoc);
    clearNotebookBtn.addEventListener('click', clearNotebook);
