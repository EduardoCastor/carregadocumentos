/* ═══════════════════════════════════════════════════════
   ENVIO DE DOCUMENTOS — script.js
═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // URL DO WEBHOOK N8N
    const WEBHOOK_URL = 'https://n8n.srv1352561.hstgr.cloud/webhook/carregadocumentos';

    // ELEMENTOS
    const form = document.getElementById('formCarregaDocumentos');
    const btnEnviar = document.getElementById('btnCarregar');
    const inputArquivos = document.getElementById('documentos');
    const listaArquivos = document.getElementById('listaArquivos');
    const successBox = document.getElementById('successAgenda');

    // CAMPOS OBRIGATÓRIOS
    const camposObrigatorios = form.querySelectorAll('[required]');

    // BOTÃO INICIA DESABILITADO
    btnEnviar.disabled = true;

    // VALIDAÇÃO DOS CAMPOS
    function validarFormulario() {

        const preenchidos = [...camposObrigatorios].every(campo => {

            if (campo.type === 'file') {
                return campo.files.length > 0;
            }

            return campo.value.trim() !== '';
        });

        btnEnviar.disabled = !preenchidos;
    }

    // MONITORA ALTERAÇÕES NOS CAMPOS
    camposObrigatorios.forEach(campo => {
        campo.addEventListener('input', validarFormulario);
        campo.addEventListener('change', validarFormulario);
    });

    // VALIDAÇÃO INICIAL
    validarFormulario();

    // LISTAR ARQUIVOS SELECIONADOS
    inputArquivos.addEventListener('change', () => {

        listaArquivos.innerHTML = '';

        const arquivos = Array.from(inputArquivos.files);

        // LIMITE DE ARQUIVOS
        if (arquivos.length > 3) {

            alert('Você pode enviar no máximo 3 arquivos PDF.');

            inputArquivos.value = '';
            listaArquivos.innerHTML = '';

            validarFormulario();

            return;
        }

        if (arquivos.length === 0) {
            validarFormulario();
            return;
        }

        arquivos.forEach((arquivo, index) => {

            const item = document.createElement('div');
            item.className = 'arquivo-item';

            item.innerHTML = `
                <strong>${index + 1}.</strong>
                ${arquivo.name}
                <span>(${formatarTamanho(arquivo.size)})</span>
            `;

            listaArquivos.appendChild(item);
        });

        validarFormulario();
    });

    // ENVIO DO FORMULÁRIO
    form.addEventListener('submit', async (e) => {

        e.preventDefault();

        const arquivos = Array.from(inputArquivos.files);

        if (arquivos.length === 0) {
            alert('Selecione pelo menos um arquivo PDF.');
            return;
        }

        // VALIDAÇÃO DE PDFs
        const arquivosInvalidos = arquivos.filter(
            file => file.type !== 'application/pdf'
        );

        if (arquivosInvalidos.length > 0) {
            alert('Todos os arquivos devem estar em formato PDF.');
            return;
        }

        btnEnviar.disabled = true;
        btnEnviar.innerHTML = 'Enviando documentos...';

        try {

            const formData = new FormData();

            // CAMPOS DO FORMULÁRIO
            formData.append(
                'numprocesso',
                document.getElementById('numprocesso').value
            );

            formData.append(
                'nome',
                document.getElementById('nome').value
            );

            formData.append(
                'celular',
                document.getElementById('celular').value
            );

            formData.append(
                'cpf',
                document.getElementById('cpf').value
            );

            formData.append(
                'email',
                document.getElementById('email').value
            );

            formData.append(
                'tipo_atendimento',
                document.getElementById('tipo_atendimento').value
            );

            // ARQUIVOS
            arquivos.forEach(file => {
                formData.append('documentos', file);
            });

            // ENVIO PARA O N8N
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Erro no envio');
            }

            form.style.display = 'none';
            successBox.classList.remove('hidden');

        } catch (error) {

            console.error(error);
            alert('Erro ao enviar os documentos. Tente novamente.');

        } finally {

            btnEnviar.innerHTML = 'Enviar Documentos';

            // Mantém a lógica de habilitação após o envio
            validarFormulario();
        }
    });

    // RESET
    window.resetFormulario = function () {

        form.reset();
        form.style.display = 'block';

        listaArquivos.innerHTML = '';

        successBox.classList.add('hidden');

        validarFormulario();
    };

    // FORMATAR TAMANHO
    function formatarTamanho(bytes) {

        if (bytes < 1024) {
            return `${bytes} B`;
        }

        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

});
