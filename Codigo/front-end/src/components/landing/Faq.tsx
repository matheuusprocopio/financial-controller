import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const QUESTIONS = [
  {
    question: "Preciso conectar minha conta do banco?",
    answer:
      "Não. Você registra as transações conversando com o assistente, por texto ou áudio. Nenhum acesso ao seu banco é necessário.",
  },
  {
    question: "Posso registrar gastos por áudio?",
    answer:
      "Sim. Toque no microfone, fale normalmente e o áudio é transcrito e interpretado como uma mensagem escrita.",
  },
  {
    question: "Como o assistente escolhe a categoria?",
    answer:
      "Ele sugere uma das categorias que você criou, com base na descrição do gasto. A sugestão aparece no formulário e você pode trocá-la antes de salvar.",
  },
  {
    question: "O que acontece se o assistente entender algo errado?",
    answer:
      "Criar, editar ou excluir qualquer registro abre um formulário já preenchido. Nada é salvo até você revisar e confirmar.",
  },
  {
    question: "Funciona no celular?",
    answer:
      "Sim. O FinancialController roda no navegador e se adapta a celulares, tablets e computadores.",
  },
];

const Faq = () => (
  <Accordion type="single" collapsible className="border-t border-white/10">
    {QUESTIONS.map((item) => (
      <AccordionItem key={item.question} value={item.question} className="border-white/10">
        <AccordionTrigger className="py-5 text-base font-normal text-neutral-100 hover:no-underline">
          {item.question}
        </AccordionTrigger>
        <AccordionContent className="pb-5 text-[15px] leading-relaxed text-neutral-400">
          {item.answer}
        </AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);

export default Faq;
