const fs = require('fs');
const path = require('path');
const moment = require('moment');

// Função para corrigir e-mails com caracteres inválidos
function corrigirEmail(email) {
    if (!email) return 'email_invalido@exemplo.com';

    email = email.replace(/[!#]/g, '@');

    const [local, dominio] = email.split('@');

    if (!dominio) {
        return `${local}@exemplo.com`;
    }

    if (!dominio.includes('.')) {
        return `${email}.com`;
    }

    return email;
}

// Função para converter idade em número
function corrigirIdade(idade) {
    const palavrasParaNumeros = {
        zero: 0, um: 1, dois: 2, três: 3, quatro: 4, cinco: 5,
        seis: 6, sete: 7, oito: 8, nove: 9, dez: 10, onze: 11,
        doze: 12, treze: 13, quatorze: 14, quinze: 15, dezesseis: 16,
        dezessete: 17, dezoito: 18, dezenove: 19, vinte: 20, trinta: 30,
        quarenta: 40, cinquenta: 50, sessenta: 60, setenta: 70,
        oitenta: 80, noventa: 90, cem: 100
    };

    if (typeof idade === 'string') {
        idade = idade.toLowerCase().trim()
            .split(' ')
            .map(palavra => palavrasParaNumeros[palavra] || palavra)
            .join(' ')
            .replace(/[^0-9]/g, '');
    }

    const idadeNumero = parseInt(idade, 10);
    return isNaN(idadeNumero) ? 'Idade inválida ou não informada' : Math.abs(idadeNumero);
}

// Função para corrigir salário
function corrigirSalario(salario) {
    const palavrasParaNumeros = {
        zero: 0, um: 1, dois: 2, três: 3, quatro: 4, cinco: 5,
        seis: 6, sete: 7, oito: 8, nove: 9, dez: 10, mil: 1000,
        milhares: 1000
    };

    if (typeof salario === 'string') {
        salario = salario.toLowerCase();
        let salarioNumero = 0;
        const partes = salario.split(' ');

        for (let parte of partes) {
            const valor = palavrasParaNumeros[parte];
            if (valor !== undefined) {
                if (valor === 1000 && salarioNumero > 0) {
                    salarioNumero *= valor;
                } else {
                    salarioNumero += valor;
                }
            }
        }

        if (salarioNumero === 0) {
            salarioNumero = parseFloat(salario.replace(/[^0-9.,]/g, '').replace(',', '.'));
        }

        return isNaN(salarioNumero) ? 0 : salarioNumero;
    }

    const salarioNumero = parseFloat(salario);
    return isNaN(salarioNumero) ? 0 : salarioNumero;
}

// Função para corrigir números de telefone
function corrigirTelefone(telefone) {
    if (!telefone || telefone.length < 10) return 'Telefone não informado';

    telefone = telefone.replace(/\D/g, '');

    if (!telefone.startsWith('55')) {
        telefone = '55' + telefone;
    }

    if (telefone.length < 11) return 'Telefone não informado';

    if (telefone.length === 11 && telefone[4] !== '9') {
        telefone = telefone.slice(0, 4) + '9' + telefone.slice(4);
    }

    return `+${telefone.slice(0, 2)} (${telefone.slice(2, 4)}) ${telefone.slice(4, 9)}-${telefone.slice(9)}`;
}

// Função para corrigir a data de cadastro
function corrigirDataCadastro(data) {
    const formatosData = ['YYYY-MM-DD', 'DD-MM-YYYY', 'YYYY-DD-MM', 'YYYY/MM/DD'];
    let dataValida = moment(data, formatosData, true);

    if (!dataValida.isValid()) {
        const partes = data.split(/[-/]/);
        if (partes.length === 3) {
            let [ano, mes, dia] = partes.map(p => parseInt(p, 10));

            if (ano && mes && dia) {
                dataValida = moment({ year: ano, month: mes - 1, day: dia });

                if (!dataValida.isValid()) {
                    dataValida = moment({ year: ano, month: mes - 1 }).endOf('month').add(1, 'day');
                }
            } else {
                dataValida = moment().add(1, 'day');
            }
        } else {
            dataValida = moment().add(1, 'day');
        }

        if (!dataValida.isValid()) return 'Data inválida';
    }

    return dataValida.format('YYYY-MM-DD');
}

// Função para limpar e normalizar os dados
function normalizarUsuarios(usuarios) {
    return usuarios.map((usuario, index) => {
        let {
            id,
            nome,
            idade,
            email,
            telefone,
            endereco,
            data_cadastro,
            ativo,
            salario,
        } = usuario;

        id = typeof id === 'number' ? id : parseInt(id, 10);
        id = isNaN(id) ? index + 1 : id;

        nome = nome ? nome.trim() : 'Nome não informado';
        idade = corrigirIdade(idade);
        email = corrigirEmail(email);
        telefone = corrigirTelefone(telefone);
        endereco = endereco ? endereco.trim() : 'Endereço não informado';
        data_cadastro = corrigirDataCadastro(data_cadastro);

        const valoresAtivo = {
            'yes': true, 'sim': true, 'true': true, '1': true, 'y': true,
            'no': false, 'não': false, 'nao': false, 'false': false, '0': false, 'n': false
        };
        ativo = valoresAtivo[String(ativo).toLowerCase()] ?? false;

        salario = corrigirSalario(salario);

        return {
            id,
            nome,
            idade,
            email,
            telefone,
            endereco,
            data_cadastro,
            ativo,
            salario,
        };
    });
}

// Leitura e processamento do arquivo JSON
fs.readFile(path.join(__dirname, 'json.txt'), 'utf8', (err, data) => {
    if (err) throw err;

    const jsonData = JSON.parse(data);
    const usuariosLimpos = normalizarUsuarios(jsonData.usuarios);

    fs.writeFile('usuarios_limpos.json', JSON.stringify({ usuarios: usuariosLimpos }, null, 2), (err) => {
        if (err) throw err;
        console.log('Dados limpos salvos em usuarios_limpos.json');
    });
});
