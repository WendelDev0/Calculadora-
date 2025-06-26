// ===================================================================================
// ARQUIVO JAVASCRIPT COMPLETO E OTIMIZADO (APP.js)
// VERSÃO: 14.1 - AJUSTE DE TIMING DO POPUP
// DESCRIÇÃO: Aumentado o tempo de espera para exibição do popup de oferta para 10
//            segundos, melhorando a experiência do usuário.
// ===================================================================================

document.addEventListener('DOMContentLoaded', () => {

    console.log("✅ APP.js v14.1 (Timing Ajustado) pronto e executando!");

    // =================================================================================
    // 1. SELETORES DE ELEMENTOS DO DOM
    // =================================================================================
    const form = document.getElementById('formCalculadora');
    const formSection = document.getElementById('formSection');
    const animationSection = document.getElementById('animationSection');
    const resultadoArea = document.getElementById('resultadoArea');
    const nomeInput = document.getElementById('nomeCliente');
    const telefoneInput = document.getElementById('telefoneCliente');
    const cepInput = document.getElementById('cep');
    const cidadeInput = document.getElementById('cidade');
    const estadoInput = document.getElementById('estado');
    const consumoInput = document.getElementById('consumoMedioKwh');
    const tipoConsumidorSelect = document.getElementById('tipoConsumidor');
    const concessionariaGroup = document.getElementById('concessionariaGroup');
    const concessionariaSelect = document.getElementById('concessionaria');
    const mensagemErro = document.getElementById('mensagemErro');
    const calcularBtn = document.getElementById('calcularBtn');
    
    // Seletores dos Modais e Oferta
    const openLgpdModalBtn = document.getElementById('openLgpdModal');
    const closeLgpdModalBtn = document.getElementById('closeLgpdModal');
    const lgpdModal = document.getElementById('lgpdModal');
    const whatsappModal = document.getElementById('whatsappModal');
    const closeWhatsappModalBtn = document.getElementById('closeWhatsappModal');
    const ctaWhatsappBtn = document.getElementById('ctaWhatsappBtn');
    
    // Seletores para o Timer e Banner Fixo
    const timerOfertaDisplay = document.getElementById('timerOferta');
    const lembreteFixoOferta = document.getElementById('lembreteFixoOferta');
    const lembreteTimerDisplay = document.getElementById('lembreteTimer');

    let resultadosSimulacao = {};
    let timerInterval = null; 
    let tempoFinalOferta = null; 

    // =================================================================================
    // 2. CONSTANTES E PARÂMETROS
    // =================================================================================
    const DURACAO_OFERTA_MINUTOS = 2;
    const NUMERO_WHATSAPP = "5575999774905";
    const TARIFA_ENERGIA_FIXA_RS_KWH = 0.82;
    const POTENCIA_PAINEL_WP = 600;
    const EFICIENCIA_SISTEMA = 0.77;
    const CUSTO_POR_WP_INSTALADO_RS = 3.7;
    const AREA_POR_PAINEL_M2 = 2.72;
    const CUSTO_FIO_B_SERGIPE_RS_KWH = .1;
    const TAXA_MINIMA_SERGIPE_RS = 80;
    const TAXA_MINIMA_OUTROS_RS = 50;
    const ICMS_RESIDENCIAL_SE_ALIQUOTA = .19;
    const ICMS_COMERCIAL_SE_ALIQUOTA = .19;
    const IRRADIACAO_SOLAR_MEDIA_SE_HSP = 4.8;
    const IRRADIACAO_SOLAR_MEDIA_OUTROS_HSP = 4.3;
    const concessionariasPorEstado = {"AC":["Energisa-AC"],"AL":["Equatorial Alagoas"],"AP":["Equatorial Amapá"],"AM":["Amazonas Energia"],"BA":["COELBA"],"CE":["ENEL-CE"],"DF":["CEB"],"ES":["EDP-ES","Santa Maria"],"GO":["Equatorial Goiás"],"MA":["Equatorial Maranhão"],"MT":["Energisa-MT"],"MS":["Energisa-MS"],"MG":["CEMIG","Energisa-MG","CPFL Santa Cruz","DMED"],"PA":["Equatorial Pará"],"PB":["Energisa-PB"],"PR":["COPEL","Energisa-PR","CPFL Santa Cruz"],"PE":["CELPE"],"PI":["Equatorial Piauí"],"RJ":["LIGHT","ENEL-RJ","Energisa-RJ"],"RN":["COSERN"],"RS":["CEEE","RGE","Hidropan","Muxfeldt"],"RO":["Energisa-RO"],"RR":["Roraima Energia"],"SC":["CELESC","Igussu"],"SP":["CPFL Paulista","ENEL-SP","Elektro","Energisa-SP"],"SE":["Energisa-SE","Cercos"],"TO":["Energisa-TO"]};


    // =================================================================================
    // 3. EVENT LISTENERS PRINCIPAIS
    // =================================================================================
    if (calcularBtn) calcularBtn.addEventListener('click', handleCalculoClick);
    if (openLgpdModalBtn) openLgpdModalBtn.addEventListener('click', (e) => { e.preventDefault(); lgpdModal.classList.add('visible'); });
    if (closeLgpdModalBtn) closeLgpdModalBtn.addEventListener('click', () => lgpdModal.classList.remove('visible'));
    if (lgpdModal) lgpdModal.addEventListener('click', (e) => { if (e.target === lgpdModal) lgpdModal.classList.remove('visible'); });
    
    if (closeWhatsappModalBtn) {
        closeWhatsappModalBtn.addEventListener('click', () => {
            whatsappModal.classList.remove('visible');
            if (timerInterval) {
                lembreteFixoOferta.classList.add('visible');
            }
        });
    }

    if (ctaWhatsappBtn) ctaWhatsappBtn.addEventListener('click', redirectToWhatsApp);

    if (lembreteFixoOferta) {
        lembreteFixoOferta.addEventListener('click', () => {
            lembreteFixoOferta.classList.remove('visible');
            whatsappModal.classList.add('visible');
        });
    }

    const camposParaValidar = [nomeInput, telefoneInput, cepInput, consumoInput, tipoConsumidorSelect, concessionariaSelect];
    camposParaValidar.forEach(campo => {
        if (campo) {
            campo.addEventListener('blur', () => validarCampoIndividual(campo));
            campo.addEventListener('input', validarEstadoFormulario);
        }
    });

    if (cepInput) cepInput.addEventListener('blur', () => buscarCep(cepInput.value));
    if (telefoneInput) telefoneInput.addEventListener('input', aplicarMascaraTelefone);
    

    // =================================================================================
    // 4. LÓGICA DE VALIDAÇÃO
    // =================================================================================
    function validarCampoIndividual(campo){let ehValido=!1;switch(campo.id){case"nomeCliente":const palavrasNome=campo.value.trim().split(" ").filter(p=>p.length>1);ehValido=palavrasNome.length>=2;break;case"telefoneCliente":ehValido=campo.value.length===15;break;case"cep":ehValido=campo.value.length===8;break;case"consumoMedioKwh":ehValido=campo.value.trim()!==""&&parseFloat(campo.value)>0;break;case"tipoConsumidor":case"concessionaria":ehValido=campo.value!=="";break;default:ehValido=!0}if(ehValido){campo.classList.remove("campo-invalido")}else{if(campo.value.trim()!==""||campo.tagName==="SELECT"){campo.classList.add("campo-invalido")}}return ehValido}
    function validarFormularioCompleto(){let isFormularioInteiroValido=!0;camposParaValidar.forEach(campo=>{if(campo.id==="concessionaria"&&getComputedStyle(concessionariaGroup).display==="none"){return}if(!validarCampoIndividual(campo)){campo.classList.add("campo-invalido");isFormularioInteiroValido=!1}});return isFormularioInteiroValido}
    function validarEstadoFormulario(){let isFormularioInteiroValido=!0;const nomeOk=nomeInput.value.trim().split(" ").filter(p=>p.length>1).length>=2;const telefoneOk=telefoneInput.value.length===15;const cepOk=cepInput.value.length===8;const consumoOk=consumoInput.value.trim()!==""&&parseFloat(consumoInput.value)>0;const tipoOk=tipoConsumidorSelect.value!=="";let concessionariaOk=!0;if(getComputedStyle(concessionariaGroup).display!=="none"){concessionariaOk=concessionariaSelect.value!==""}isFormularioInteiroValido=nomeOk&&telefoneOk&&cepOk&&consumoOk&&tipoOk&&concessionariaOk;calcularBtn.disabled=!isFormularioInteiroValido;if(isFormularioInteiroValido){exibirMensagemErro("")}}


    // =================================================================================
    // 5. LÓGICA DO TIMER DE OFERTA
    // =================================================================================
    
    function iniciarTimerOferta(duracaoMinutos) {
        clearInterval(timerInterval);
        lembreteFixoOferta.classList.remove('visible');

        const duracaoSegundos = duracaoMinutos * 60;
        tempoFinalOferta = Date.now() + duracaoSegundos * 1000;

        timerInterval = setInterval(() => {
            const agora = Date.now();
            const tempoRestante = Math.round((tempoFinalOferta - agora) / 1000);

            if (tempoRestante <= 0) {
                clearInterval(timerInterval);
                timerInterval = null; 
                timerOfertaDisplay.textContent = "Sua condição especial expirou!";
                lembreteFixoOferta.classList.remove('visible');
            } else {
                const minutos = Math.floor(tempoRestante / 60);
                const segundos = tempoRestante % 60;
                const tempoFormatado = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
                
                timerOfertaDisplay.innerHTML = `Sua condição especial expira em: <strong>${tempoFormatado}</strong>`;
                lembreteTimerDisplay.textContent = tempoFormatado;
            }
        }, 1000);
    }


    // =================================================================================
    // 6. LÓGICA PRINCIPAL E FUNÇÕES
    // =================================================================================

    function handleCalculoClick() {
        exibirMensagemErro("");
        const isFormularioValido = validarFormularioCompleto();

        if (!isFormularioValido) {
            exibirMensagemErro("Por favor, corrija os campos destacados em vermelho.");
            const primeiroCampoInvalido = form.querySelector('.campo-invalido');
            if (primeiroCampoInvalido) primeiroCampoInvalido.focus();
            return;
        }

        resultadoArea.style.display = 'none';
        animationSection.style.display = 'block';
        animationSection.scrollIntoView({ behavior: 'smooth', block: 'center' });

        setTimeout(() => {
            try {
                resultadosSimulacao = simularSistemaFotovoltaico({ consumoMedioKwh: consumoInput.value, tipoConsumidor: tipoConsumidorSelect.value, estado: estadoInput.value });
                enviarDadosParaAPI(resultadosSimulacao);
                animationSection.style.display = 'none';
                exibirResultado(resultadosSimulacao);

                // [ALTERADO] O tempo de espera foi aumentado para 10 segundos (10000 ms)
                setTimeout(() => {
                    if (whatsappModal) {
                        whatsappModal.classList.add('visible');
                        iniciarTimerOferta(DURACAO_OFERTA_MINUTOS);
                    }
                }, 10000); 

            } catch (error) {
                exibirMensagemErro(`Erro na simulação: ${error.message}`);
                animationSection.style.display = 'none';
                formSection.style.display = 'block';
            }
        }, 4000);
    }
    
    function redirectToWhatsApp() {
        clearInterval(timerInterval);
        timerInterval = null;
        lembreteFixoOferta.classList.remove('visible');

        const nome = nomeInput.value.trim();
        const consumo = consumoInput.value;
        const valorMinimo = formatarMoeda(resultadosSimulacao.faixaDePrecoMenor);
        const valorMaximo = formatarMoeda(resultadosSimulacao.faixaDePrecoMaior);
        const texto = `Olá! A calculadora liberou uma condição especial para mim e quero saber mais. Minha simulação foi de ${consumo} kWh, com investimento entre ${valorMinimo} e ${valorMaximo}. Como funciona essa condição exclusiva? Meu nome é ${nome}.`;
        const urlWhatsApp = `https://api.whatsapp.com/send?phone=${NUMERO_WHATSAPP}&text=${encodeURIComponent(texto)}`;
        window.open(urlWhatsApp, '_blank');
    }

    function enviarDadosParaAPI(resultados){const dados={nomeCliente:nomeInput.value,telefoneCliente:telefoneInput.value,cep:cepInput.value,cidade:cidadeInput.value,estado:estadoInput.value,consumoMedioKwh:consumoInput.value,tipoConsumidor:tipoConsumidorSelect.value,concessionaria:concessionariaSelect.value,potenciaDoKitKWp:resultados.potenciaDoKitKWp,producaoMensalKWh:resultados.producaoMensalKWh,numeroDePaineis:resultados.numeroDePaineis,areaNecessaria:resultados.areaNecessaria,investimentoEstimado:(resultados.faixaDePrecoMenor+resultados.faixaDePrecoMaior)/2,economiaAnual:resultados.economiaAnual,paybackMeses:resultados.paybackMeses===Infinity?null:resultados.paybackMeses};fetch("/api/salvar-lead.php",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(dados)}).then(response=>response.ok?response.json():response.json().then(err=>Promise.reject(err))).then(data=>console.log("✅ Sucesso! Resposta da API:",data.message)).catch(error=>console.error("❌ Falha na comunicação com a API PHP:",error.message||"Erro desconhecido."))}
    function simularSistemaFotovoltaico(dados){const consumoMensal=parseFloat(dados.consumoMedioKwh);const estado=dados.estado?dados.estado.toUpperCase():"";const tipoConsumidor=dados.tipoConsumidor;if(isNaN(consumoMensal)||consumoMensal<=0)throw new Error("Consumo de energia inválido.");const hsp=estado==="SE"?IRRADIACAO_SOLAR_MEDIA_SE_HSP:IRRADIACAO_SOLAR_MEDIA_OUTROS_HSP;const taxaMinima=estado==="SE"?TAXA_MINIMA_SERGIPE_RS:TAXA_MINIMA_OUTROS_RS;const consumoDiario=consumoMensal/30;const potenciaPicoNecessariaKWp=consumoDiario/(hsp*EFICIENCIA_SISTEMA);const numeroDePaineis=Math.ceil(potenciaPicoNecessariaKWp*1e3/POTENCIA_PAINEL_WP);const potenciaRealDoKitKWp=numeroDePaineis*POTENCIA_PAINEL_WP/1e3;const geracaoMensalEstimadaKWh=potenciaRealDoKitKWp*hsp*30*EFICIENCIA_SISTEMA;const custoTotalEstimado=potenciaRealDoKitKWp*1e3*CUSTO_POR_WP_INSTALADO_RS;const valorContaAtual=consumoMensal*TARIFA_ENERGIA_FIXA_RS_KWH;let economiaMensal=0;let observacoes="Simulação baseada na Lei 14.300/2022. ";if(estado==="SE"){let icms=0;if(tipoConsumidor==="residencial"&&consumoMensal>50)icms=valorContaAtual*ICMS_RESIDENCIAL_SE_ALIQUOTA;else if(tipoConsumidor==="comercial")icms=valorContaAtual*ICMS_COMERCIAL_SE_ALIQUOTA;if(icms>0)observacoes+="ICMS de 19% foi considerado. ";const custoFioB=geracaoMensalEstimadaKWh>consumoMensal?(geracaoMensalEstimadaKWh-consumoMensal)*CUSTO_FIO_B_SERGIPE_RS_KWH:0;economiaMensal=valorContaAtual+icms-taxaMinima-custoFioB;observacoes+=`Taxa Mínima de R$ ${taxaMinima.toFixed(2)} e Custo Fio B (se aplicável) foram considerados.`}else{economiaMensal=valorContaAtual-taxaMinima;observacoes+=`Taxa Mínima de R$ ${taxaMinima.toFixed(2)} foi considerada.`}const paybackMeses=economiaMensal>0?custoTotalEstimado/economiaMensal:Infinity;return{economiaAnual:economiaMensal*12>0?economiaMensal*12:0,paybackMeses:paybackMeses,areaNecessaria:numeroDePaineis*AREA_POR_PAINEL_M2,potenciaDoKitKWp:potenciaRealDoKitKWp,numeroDePaineis:numeroDePaineis,producaoMensalKWh:geracaoMensalEstimadaKWh,faixaDePrecoMenor:custoTotalEstimado*.9,faixaDePrecoMaior:custoTotalEstimado*1.1,observacoes:observacoes}}
    function exibirResultado(resultados){const rc=document.getElementById("resultadoConteudo");if(!rc)return;const economiaAnualFmt=formatarMoeda(resultados.economiaAnual);const paybackFmt=formatarPayback(resultados.paybackMeses);const areaFmt=`${formatarNumero(resultados.areaNecessaria)} m²`;const potenciaFmt=`${formatarNumero(resultados.potenciaDoKitKWp)} kWp`;const producaoFmt=`${formatarNumero(resultados.producaoMensalKWh,0)} kWh/mês`;const precoFmt=`Entre ${formatarMoeda(resultados.faixaDePrecoMenor)} e ${formatarMoeda(resultados.faixaDePrecoMaior)}`;rc.innerHTML=`
            <div class="resultado-coluna-esquerda">
                <div class="resultado-item-principal">
                    <span class="label-destaque">Economia Anual Estimada</span>
                    <span class="valor-destaque-grande">${economiaAnualFmt}</span>
                    <p>Este é o valor que você pode deixar de pagar à concessionária todo ano.</p>
                </div>
                <div class="resultado-item-principal">
                    <span class="label-destaque">Tempo de Retorno (Payback)</span>
                    <span class="valor-destaque-media">${paybackFmt}</span>
                </div>
                <div class="resultado-item-principal">
                    <span class="label-destaque">Investimento Estimado</span>
                    <span class="valor-destaque-media">${precoFmt}</span>
                </div>
            </div>
            <div class="resultado-coluna-direita">
                <div class="resultado-item"><span class="label">Potência do Sistema</span><span class="valor-destaque-media">${potenciaFmt}</span></div>
                <div class="resultado-item"><span class="label">Nº de Painéis de ${POTENCIA_PAINEL_WP}Wp</span><span class="valor-destaque-media">${resultados.numeroDePaineis}</span></div>
                <div class="resultado-item"><span class="label">Área Mínima Necessária</span><span class="valor-destaque-media">${areaFmt}</span></div>
                <div class="resultado-item"><span class="label">Produção Mensal Estimada</span><span class="valor-destaque-media">${producaoFmt}</span></div>
            </div>
            <div class="resultado-observacoes-geral"><h4>Observações da Simulação:</h4><p>${resultados.observacoes}</p></div>
        `;resultadoArea.style.display="flex";resultadoArea.scrollIntoView({behavior:"smooth"})}
    function aplicarMascaraTelefone(e){let valor=e.target.value.replace(/\D/g,"").substring(0,11);let formatado="";if(valor.length>0)formatado=`(${valor.substring(0,2)}`;if(valor.length>2)formatado+=`) ${valor.substring(2,7)}`;if(valor.length>7)formatado+=`-${valor.substring(7,11)}`;e.target.value=formatado}
    async function buscarCep(cep){const cepLimpo=cep.replace(/\D/g,"");if(cepLimpo.length!==8)return;exibirMensagemErro("");if(cidadeInput)cidadeInput.value="Buscando...";if(estadoInput)estadoInput.value="...";if(concessionariaGroup)concessionariaGroup.style.display="none";try{const response=await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);if(!response.ok)throw new Error("Falha ao buscar o CEP. Tente novamente.");const data=await response.json();if(data.erro)throw new Error("CEP não encontrado ou inválido.");if(cidadeInput)cidadeInput.value=data.localidade;if(estadoInput)estadoInput.value=data.uf;const listaConcessionarias=concessionariasPorEstado[data.uf];if(listaConcessionarias&&concessionariaGroup&&concessionariaSelect){concessionariaSelect.innerHTML='<option value="">Selecione...</option>';listaConcessionarias.forEach(nome=>{const option=document.createElement("option");option.value=nome;option.textContent=nome;concessionariaSelect.appendChild(option)});concessionariaGroup.style.display="block"}}catch(error){exibirMensagemErro(error.message);if(cidadeInput)cidadeInput.value="";if(estadoInput)estadoInput.value=""}finally{validarEstadoFormulario()}}
    function formatarMoeda(valor){return new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(valor)}
    function formatarNumero(valor,casas=2){return new Intl.NumberFormat("pt-BR",{minimumFractionDigits:casas,maximumFractionDigits:casas}).format(valor)}
    function formatarPayback(meses){if(meses===Infinity)return"N/D (Economia Baixa)";const anos=Math.floor(meses/12);const mesesRestantes=Math.round(meses%12);if(anos>0&&mesesRestantes>0)return`${anos} anos e ${mesesRestantes} meses`;if(anos>0)return`${anos} anos`;if(mesesRestantes>0)return`${mesesRestantes} meses`;return"Menos de 1 mês"}
    function exibirMensagemErro(msg){if(mensagemErro){mensagemErro.textContent=msg;mensagemErro.style.display=msg?"block":"none"}}

    // Inicialização
    validarEstadoFormulario();
});
