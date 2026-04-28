'use client';

import React, { useState, useRef, useCallback, FormEvent, ChangeEvent } from 'react';
import Image from 'next/image';

// Salesforce Web-to-Case — SANDBOX (trocar para producao quando necessario)
const SF_WEB_TO_CASE_URL =
  'https://moovelub--full.sandbox.my.salesforce.com/servlet/servlet.WebToCase?encoding=UTF-8&orgId=00Dbe000001789x';
const SF_ORG_ID = '00Dbe000001789x';
const SF_RECORD_TYPE = '012bJ000000GZujQAG';
const SF_STATUS = 'Atendimento N1';
const SF_RET_URL = 'https://www.brq.com/';

interface ContactFormBlockProps {
  section_title: string;
  section_description: string;
  section_description_2: string;
  section_image: {
    url: string;
    alt: string;
    width: number;
    height: number;
  } | null;
  form_title: string;
  form_subtitle: string;
  form_note: string;
  form_cf7_id: string | number;
  success_title: string;
  success_message: string;
  success_button_text: string;
  error_title: string;
  error_message: string;
  error_button_text: string;
}

type FormState = 'form' | 'success' | 'error';

interface FormData {
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  privacy: boolean;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  subject?: string;
  message?: string;
  privacy?: string;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function ContactFormBlock({
  section_title,
  section_description,
  section_description_2,
  section_image,
  form_title,
  form_subtitle,
  form_note,
  form_cf7_id,
  success_title,
  success_message,
  success_button_text,
  error_title,
  error_message,
  error_button_text,
}: ContactFormBlockProps) {
  const sfFormRef = useRef<HTMLFormElement>(null);
  const iframeLoadCount = useRef(0);

  const [formState, setFormState] = useState<FormState>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
    privacy: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === 'phone') {
      setFormData(prev => ({ ...prev, phone: formatPhone(value) }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  }

  function validate(): FormErrors {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Campo obrigatório';
    if (!formData.phone.trim() || formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Celular inválido';
    }
    if (!formData.email.trim() || !validateEmail(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Campo obrigatório';
    if (!formData.message.trim()) newErrors.message = 'Campo obrigatório';
    if (!formData.privacy) newErrors.privacy = 'Você deve aceitar os termos';
    return newErrors;
  }

  const handleIframeLoad = useCallback(() => {
    // O iframe dispara onLoad na montagem inicial (sobre:blank).
    // Incrementamos o contador e so tratamos como resposta do Salesforce a partir do 2o load.
    iframeLoadCount.current += 1;
    if (iframeLoadCount.current <= 1) return;

    setIsSubmitting(false);
    setFormState('success');
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const form = sfFormRef.current;
      if (!form) throw new Error('Salesforce form ref not found');

      // Preenche os campos do form oculto com os dados do formulario visivel
      (form.elements.namedItem('name') as HTMLInputElement).value = formData.name;
      (form.elements.namedItem('email') as HTMLInputElement).value = formData.email;
      (form.elements.namedItem('phone') as HTMLInputElement).value = formData.phone;
      (form.elements.namedItem('subject') as HTMLInputElement).value = formData.subject;
      (form.elements.namedItem('description') as HTMLTextAreaElement).value = formData.message;

      form.submit();

      // Timeout de seguranca: se o iframe nao carregar em 10s, assume sucesso
      // (o POST do Web-to-Case nao retorna erro acessivel via iframe cross-origin)
      setTimeout(() => {
        setIsSubmitting(prev => {
          if (prev) {
            setFormState('success');
            return false;
          }
          return prev;
        });
      }, 10000);
    } catch {
      setFormState('error');
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setFormData({ name: '', phone: '', email: '', subject: '', message: '', privacy: false });
    setErrors({});
    setFormState('form');
  }

  const inputBase = 'w-full h-10 border rounded px-3 text-base text-dark-blue placeholder:text-[#6d7280] outline-none focus:border-blue transition-colors';

  return (
    <section className="bg-transparent-gray">
      <div className="container py-8 md:py-10 lg:py-[60px]">
        <div className="flex flex-col lg:flex-row gap-8 md:gap-10 lg:gap-[80px]">
          {/* Coluna esquerda - Texto + Imagem */}
          <div className="lg:flex-1 flex flex-col justify-between">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl md:text-[28px] lg:text-[2.5rem] font-semibold text-dark-blue leading-tight tracking-[-0.5px]">
                {section_title}
              </h1>
              {section_description && (
                <p className="text-base text-low-dark-blue leading-[1.5]">
                  {section_description}
                </p>
              )}
              {section_description_2 && (
                <div
                  className="text-base text-low-dark-blue leading-[1.5] [&_a]:underline [&_a]:decoration-solid"
                  dangerouslySetInnerHTML={{ __html: section_description_2 }}
                />
              )}
            </div>
            {section_image && (
              <div className="w-full mt-[90px]">
                <Image
                  src={section_image.url}
                  alt={section_image.alt || ''}
                  width={section_image.width}
                  height={section_image.height}
                  className="w-full h-auto rounded-[8px] object-cover"
                />
              </div>
            )}
          </div>

          {/* Coluna direita - Formulário / Sucesso / Erro */}
          <div className="w-full lg:w-[548px] lg:shrink-0">
            {formState === 'form' && (
              <div className="bg-white rounded-2xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.1)] p-4 md:p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-dark-blue leading-tight mb-3">
                    {form_title}
                  </h2>
                  <p className="text-sm text-low-dark-blue leading-[1.5]">
                    {form_subtitle}
                  </p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  <div className="flex flex-col gap-4">
                    {/* Nome + Celular */}
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <label htmlFor="contact-name" className="block text-base text-low-dark-blue mb-2 leading-[20px]">
                          Nome
                        </label>
                        <input
                          id="contact-name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Ana Paula Silva"
                          className={`${inputBase} ${errors.name ? 'border-red' : 'border-gray'}`}
                        />
                        {errors.name && <span className="text-xs text-red mt-1 block">{errors.name}</span>}
                      </div>
                      <div className="flex-1">
                        <label htmlFor="contact-phone" className="block text-base text-low-dark-blue mb-2 leading-[20px]">
                          Celular
                        </label>
                        <input
                          id="contact-phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="(11) 91234-5678"
                          className={`${inputBase} ${errors.phone ? 'border-red' : 'border-gray'}`}
                        />
                        {errors.phone && <span className="text-xs text-red mt-1 block">{errors.phone}</span>}
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="contact-email" className="block text-base text-low-dark-blue mb-2 leading-[20px]">
                        E-mail
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="exemplo@dominio.com"
                        className={`${inputBase} ${errors.email ? 'border-red' : 'border-gray'}`}
                      />
                      {errors.email && <span className="text-xs text-red mt-1 block">{errors.email}</span>}
                    </div>

                    {/* Assunto */}
                    <div>
                      <label htmlFor="contact-subject" className="block text-base text-low-dark-blue mb-2 leading-[20px]">
                        Assunto
                      </label>
                      <input
                        id="contact-subject"
                        name="subject"
                        type="text"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Escreva aqui o assunto"
                        className={`${inputBase} ${errors.subject ? 'border-red' : 'border-gray'}`}
                      />
                      {errors.subject && <span className="text-xs text-red mt-1 block">{errors.subject}</span>}
                    </div>

                    {/* Mensagem */}
                    <div>
                      <label htmlFor="contact-message" className="block text-base text-low-dark-blue mb-2 leading-[20px]">
                        Mensagem
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Escreva sua dúvida ou sugestão"
                        rows={5}
                        className={`w-full border rounded px-3 py-2 text-base text-dark-blue placeholder:text-[#6d7280] outline-none focus:border-blue transition-colors resize-none ${errors.message ? 'border-red' : 'border-gray'}`}
                      />
                      {errors.message && <span className="text-xs text-red mt-1 block">{errors.message}</span>}
                    </div>

                    {/* Nota técnica */}
                    {form_note && (
                      <p className="text-xs text-low-dark-blue leading-[1.5]">{form_note}</p>
                    )}

                    {/* Aceite privacidade */}
                    <div>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="privacy"
                          checked={formData.privacy}
                          onChange={handleChange}
                          className="mt-0.5 w-[18px] h-[18px] min-w-[18px] accent-dark-blue rounded-sm border-neutral"
                        />
                        <span className="text-sm text-low-dark-blue leading-[1.5]">
                          Li os termos estabelecidos na{' '}
                          <a href="/politica-de-privacidade" target="_blank" className="underline decoration-solid">
                            Política de Privacidade
                          </a>{' '}
                          e nos{' '}
                          <a href="/termos-de-uso" target="_blank" className="underline decoration-solid">
                            Termos de Uso
                          </a>.
                        </span>
                      </label>
                      {errors.privacy && <span className="text-xs text-red mt-1 block ml-[26px]">{errors.privacy}</span>}
                    </div>
                  </div>

                  {/* Botão enviar */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-red text-white text-base font-normal h-10 rounded hover:bg-red/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-6"
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar'}
                  </button>
                </form>
              </div>
            )}

            {formState === 'success' && (
              <div className="bg-white rounded-2xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.1)] p-4 md:p-8 lg:p-[48px] flex flex-col items-start">
                {/* Ícone sucesso */}
                <div className="w-[52px] h-[52px] rounded bg-[#0014501F] flex items-center justify-center mb-6">
                  <span className="w-[25px] h-[25px] rounded-full bg-dark-blue flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 13L9.5 17.5L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </div>
                <h2 className="text-2xl font-semibold text-dark-blue mb-4">
                  {success_title || 'Obrigado pelo contato!'}
                </h2>
                <p className="text-base text-low-dark-blue leading-[1.5] mb-8">
                  {success_message || 'Recebemos suas informações e nossa equipe especializada já está cuidando de sua solicitação. Em breve, retornaremos com uma resposta.'}
                </p>
                <button
                  onClick={handleReset}
                  className="w-full bg-red text-white text-base font-normal h-10 rounded hover:bg-red/90 transition-colors"
                >
                  {success_button_text || 'Enviar nova solicitação'}
                </button>
              </div>
            )}

            {formState === 'error' && (
              <div className="bg-white rounded-2xl shadow-[0px_4px_10px_0px_rgba(0,0,0,0.1)] p-4 md:p-8 lg:p-[48px] flex flex-col items-start">
                {/* Ícone erro */}
                <div className="w-[52px] h-[52px] rounded-full bg-[rgba(208,0,10,0.1)] flex items-center justify-center mb-6">
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.268 3.5L2.134 24.5C1.78 25.11 1.78 25.89 2.134 26.5C2.488 27.11 3.134 27.5 3.866 27.5H28.134C28.866 27.5 29.512 27.11 29.866 26.5C30.22 25.89 30.22 25.11 29.866 24.5L17.732 3.5C17.378 2.89 16.732 2.5 16 2.5C15.268 2.5 14.622 2.89 14.268 3.5Z" fill="rgba(208,0,10,0.15)" stroke="#d0000a" strokeWidth="2" strokeLinejoin="round" />
                    <path d="M16 11.5V17.5" stroke="#d0000a" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="16" cy="22" r="1.5" fill="#d0000a" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-dark-blue mb-4">
                  {error_title || 'Não foi possível concluir o envio.'}
                </h2>
                <p className="text-base text-low-dark-blue leading-[1.5] mb-8">
                  {error_message || 'Estamos verificando o problema. Enquanto isso, tente novamente ou entre em contato por outro canal.'}
                </p>
                <button
                  onClick={handleReset}
                  className="w-full bg-red text-white text-base font-normal h-10 rounded hover:bg-red/90 transition-colors"
                >
                  {error_button_text || 'Tentar novamente'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Salesforce Web-to-Case: iframe + form ocultos */}
      <iframe
        name="salesforce-frame"
        id="salesforce-frame"
        title="Salesforce Web-to-Case"
        style={{ display: 'none' }}
        onLoad={handleIframeLoad}
      />
      <form
        ref={sfFormRef}
        action={SF_WEB_TO_CASE_URL}
        method="POST"
        target="salesforce-frame"
        style={{ display: 'none' }}
      >
        <input type="hidden" name="orgid" value={SF_ORG_ID} />
        <input type="hidden" name="retURL" value={SF_RET_URL} />
        <input type="hidden" name="recordType" value={SF_RECORD_TYPE} />
        <input type="hidden" name="status" value={SF_STATUS} />
        <input type="hidden" name="name" />
        <input type="hidden" name="email" />
        <input type="hidden" name="phone" />
        <input type="hidden" name="subject" />
        <textarea name="description" style={{ display: 'none' }} />
      </form>
    </section>
  );
}
