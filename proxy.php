<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Configurações
define('DATA_DIR', __DIR__ . '/data/');
define('CONTEXT_FILES', ['chamados.json', 'clientes.json', 'conhecimentos.json' , 'configOnu.json']); // Arquivos de contexto

// Carrega o contexto dos arquivos JSON
function load_context() {
    $context = "";
    foreach (CONTEXT_FILES as $file) {
        $path = DATA_DIR . $file;
        if (file_exists($path)) {
            $data = json_decode(file_get_contents($path), true);
            $context .= "Base de conhecimento ($file):\n" . json_encode($data, JSON_PRETTY_PRINT) . "\n\n";
        }
    }
    return $context;
}

// Entrada do usuário
$input = json_decode(file_get_contents("php://input"), true);
$prompt = $input["prompt"] ?? "Olá";

// Carrega o contexto da base de dados
$database_context = load_context();

// Mensagem de sistema
$system_message = [
    "role" => "system",
    "content" => "Você é um assistente técnico que responde **exclusivamente com base nos dados fornecidos abaixo**. Nunca gere comandos ou respostas fora desse conteúdo. Caso a resposta não esteja contida diretamente na base, diga: 'Não encontrei essa informação em meus registros'...




1. Formatação:
- Use **negrito** para títulos e ênfase
- *Itálico* para observações secundárias
- Tabelas Markdown para dados estruturados
- ``` para blocos de código/dados
- Emojis relevantes (📁, 🔍, ℹ️)
- Responda sempre em Portugues-Brasil

2. Contexto disponível:
$database_context

3. Nunca mencione os arquivos JSON diretamente
4. Para perguntas sobre dados existentes, sempre consulte o contexto antes de responder
5. Se não souber a resposta, diga 'Não encontrei essa informação em meus registros'"

];

// Corpo da requisição para o LM Studio
$body = json_encode([
    "model" => "deepseek-r1-distill-qwen-7b",
    "messages" => [
        $system_message,
        ["role" => "user", "content" => $prompt]
    ],
    "temperature" => 0.7,
    "max_tokens" => 1500
]);

// Envio via cURL
$ch = curl_init("http://127.0.0.1:1234/v1/chat/completions");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
$result = curl_exec($ch);
curl_close($ch);

// Processamento da resposta
$data = json_decode($result, true);
$raw_response = $data["choices"][0]["message"]["content"] ?? "Sem resposta.";

// Remove tags <think> e seu conteúdo
$raw_response = preg_replace('/<think>.*?<\/think>/is', '', $raw_response);

// Conversão de Markdown para HTML
function markdown_to_html($text) {
    $html = htmlspecialchars($text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

    // Negrito
    $html = preg_replace('/\*\*(.*?)\*\*/s', '<strong>$1</strong>', $html);

    // Itálico
    $html = preg_replace('/\*(.*?)\*/s', '<em>$1</em>', $html);

    // Blocos de código
    $html = preg_replace('/```(.*?)```/s', '<pre><code>$1</code></pre>', $html);

    // Tabelas Markdown básicas
    $html = preg_replace_callback('/\|(.+?)\|/s', function($matches) {
        $rows = explode("\n", trim($matches[1]));
        $table = '<table class="table">';
        foreach ($rows as $i => $row) {
            $cells = array_map('trim', explode('|', $row));
            $table .= $i === 0 ? '<thead><tr>' : '<tr>';
            foreach ($cells as $cell) {
                if ($cell !== '') {
                    $tag = $i === 0 ? 'th' : 'td';
                    $table .= "<$tag>$cell</$tag>";
                }
            }
            $table .= $i === 0 ? '</tr></thead><tbody>' : '</tr>';
        }
        return $table . '</tbody></table>';
    }, $html);

    // Quebras de linha
    $html = nl2br($html);

    return $html;
}

// Retorno final
echo json_encode([
    "resposta" => trim($raw_response),
    "html" => markdown_to_html($raw_response),
    "contexto_utilizado" => !empty($database_context)
]);
?>
