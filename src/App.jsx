import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'

import { Input } from './components/Input'
import { Button } from './components/Button'
import { CounterInput } from './components/CounterInput'
import { InputSelect } from './components/InputSelect'
import { StepMarker } from './components/StepMarker'

// Função para validar número de telefone
const validatePhoneNumber = (phone) => {
  const regex = /^\(\d{2}\) \d \d{4}-\d{4}$/
  return regex.test(phone)
}

// Função para formatar número de telefone
const formatPhoneNumber = (phone) => {
  phone = phone.replace(/[^\d]+/g, '')
  if (phone.length > 11) phone = phone.slice(0, 11)
  if (phone.length > 6)
    return `(${phone.slice(0, 2)}) ${phone.slice(2, 3)} ${phone.slice(3, 7)}-${phone.slice(7)}`
  if (phone.length > 2) return `(${phone.slice(0, 2)}) ${phone.slice(2)}`
  return phone
}

const encode = (data) => {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&')
}

const InfoDataSchema = z.object({
  whatsapp: z.string().refine(validatePhoneNumber, {
    message: 'Número de telefone inválido. Use o formato (99) 9 1111-1111'
  }),
  nome: z.string().min(1, 'Campo obrigatório.'),
  email: z.string().min(1, 'Campo obrigatório.'),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Você deve aceitar os termos'
  })
})

const PropDataSchema = z.object({
  temPropriedade: z.string().min(1, 'Campo obrigatório.'),
  metrosDaPropriedade: z.string().min(1, 'Campo obrigatório.'),
  bairroDeConstrucao: z.string().min(1, 'Campo obrigatório.'),
  temProjeto: z.string().min(1, 'Campo obrigatório.')
})

const OptionsDataSchema = z.object({
  padraoDeAcabamento: z.string().min(1, 'Campo obrigatório.'),
  tempoParaIniciarAObra: z.string().min(1, 'Campo obrigatório.'),
  orçamentoDisponivel: z.string().min(1, 'Campo obrigatório.'),
  formaDePagamento: z.string().min(1, 'Campo obrigatório.')
})

function App() {
  const [step, setStep] = useState(0)

  const {
    register: infoRegister,
    watch: watchInfoValue,
    setValue: setInfoValue,
    handleSubmit: handleInfoSubmit,
    getValues: getInfoValues,
    formState: { errors: infoErrors }
  } = useForm({
    defaultValues: {
      nome: '',
      email: '',
      whatsapp: '',
      acceptTerms: false
    },
    resolver: zodResolver(InfoDataSchema)
  })

  const {
    register: propRegister,
    handleSubmit: handlePropSubmit,
    getValues: getPropValues,
    formState: { errors: propErrors },
    watch: watchPropValue,
    setValue: setPropValue
  } = useForm({
    defaultValues: {
      temPropriedade: '',
      metrosDaPropriedade: '',
      bairroDeConstrucao: '',
      temProjeto: ''
    },
    resolver: zodResolver(PropDataSchema)
  })

  const {
    handleSubmit: handleAmountSubmit,
    watch: watchAmoutValue,
    getValues: getAmoutValue,
    setValue: setAmountValue
  } = useForm({
    defaultValues: {
      suiteMaster: 0,
      suite: 0,
      quarto: 0,
      salaDeEstar: 0,
      escritorio: 0,
      cozinha: 0,
      salaDeJantar: 0,
      lavabo: 0,
      home: 0,
      areaGourmet: 0,
      garagemCoberta: 0,
      roupeiro: 0,
      deposito: 0,
      piscina: 0
    }
  })

  const {
    handleSubmit: handleOptionsSubmit,
    setValue: setOptionsValue,
    getValues: getOptionsValue,
    watch: watchOptionsValue,
    formState: { errors: optionsErrors }
  } = useForm({
    defaultValues: {
      padraoDeAcabamento: '',
      tempoParaIniciarAObra: '',
      orçamentoDisponivel: '',
      formaDePagamento: ''
    },
    resolver: zodResolver(OptionsDataSchema)
  })

  const phoneNumberValue = watchInfoValue('whatsapp')

  useEffect(() => {
    setInfoValue('whatsapp', formatPhoneNumber(phoneNumberValue))
  }, [phoneNumberValue, setInfoValue])

  const handleSubmitForm = () => {
    const infoData = getInfoValues()
    const propData = getPropValues()
    const amoutData = getAmoutValue()
    const optionsData = getOptionsValue()
    const encodedData = encode({
      'form-name': 'contact',
      nome: infoData.nome,
      name: infoData.nome,
      email: infoData.email,
      message: JSON.stringify({
        name: infoData.nome,
        email: infoData.email,
        whatsapp: infoData.whatsapp,
        temPropriedade: propData.temPropriedade,
        metrosDaPropriedade: propData.metrosDaPropriedade,
        bairroDeConstrucao: propData.bairroDeConstrucao.toString(),
        temProjeto: propData.temProjeto.toString(),
        suiteMaster: amoutData.suiteMaster.toString(),
        suite: amoutData.suite.toString(),
        quarto: amoutData.quarto.toString(),
        salaDeEstar: amoutData.salaDeEstar.toString(),
        escritorio: amoutData.escritorio.toString(),
        cozinha: amoutData.cozinha.toString(),
        salaDeJantar: amoutData.salaDeJantar.toString(),
        lavabo: amoutData.lavabo.toString(),
        home: amoutData.home.toString(),
        areaGourmet: amoutData.areaGourmet.toString(),
        garagemCoberta: amoutData.garagemCoberta.toString(),
        roupeiro: amoutData.roupeiro.toString(),
        deposito: amoutData.deposito.toString(),
        piscina: amoutData.piscina.toString(),
        padraoDeAcabamento: optionsData.padraoDeAcabamento,
        tempoParaIniciarAObra: optionsData.tempoParaIniciarAObra,
        orcamentoDisponivel: optionsData.orçamentoDisponivel,
        formaDePagamento: optionsData.formaDePagamento
      })
    })

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encodedData
    })
      .then((e) => console.log(e))
      .catch((err) => console.log(err))
  }

  let currentForm
  if (step === 0) {
    currentForm = (
      <motion.div
        key="step-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-4 flex flex-col items-center gap-10">
          <img src="./logo.png" alt="logo" className="w-[200px]" />
          <div className="flex flex-col items-center gap-2 -mt-10">
            <h1 className="font-semibold text-center text-2xl text-white">
              Calculadora de orçamento de casa no DF
            </h1>
            <p className="font-normal text-white/80">
              Tempo de preenchimento: 3 minutos
            </p>
          </div>
          <div className="w-full flex gap-4 px-4">
            <Button
              label="INICIAR"
              type="button"
              buttonAction={() => setStep(1)}
            />
          </div>
        </div>
      </motion.div>
    )
  } else if (step === 1) {
    currentForm = (
      <motion.div
        key="step-2"
        initial={{ opacity: 0, y: 20, height: 250 }}
        animate={{ opacity: 1, y: 0, height: 'fit-content' }}
        exit={{ opacity: 0, y: 20, height: 250 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleInfoSubmit(() => setStep((e) => e + 1))}>
          <div className="p-4 flex flex-col gap-2">
            <Input
              id={'nome'}
              label={'Nome'}
              required
              register={infoRegister}
              error={infoErrors.nome}
            />
            <Input
              id={'email'}
              label={'Seu melhor email'}
              required
              register={infoRegister}
              error={infoErrors.email}
            />
            <Input
              id={'whatsapp'}
              label={'Whatsapp'}
              required
              register={infoRegister}
              error={infoErrors.whatsapp}
            />
            <p className="text-neutral-100">
              *O seu orçamento será enviado por whatsapp
            </p>
            <div className="w-full flex items-center mt-4 gap-2">
              <input
                type="checkbox"
                id="acceptTerms"
                {...infoRegister('acceptTerms')}
                className="w-5 h-5 cursor-pointer accent-blue-500"
                style={{
                  backgroundColor: 'rgb(244 63 94)'
                }}
              />
              <label
                htmlFor="acceptTerms"
                className="text-center pt-2 cursor-pointer text-white/80"
              >
                Ao selecionar essa opção você aceita receber informações da
                Península nos contatos informados acima
              </label>
            </div>
            {infoErrors.acceptTerms && (
              <span className="text-red-500">
                {infoErrors.acceptTerms.message}
              </span>
            )}
          </div>
          <div className="w-full flex gap-4 px-4">
            <Button label="Próximo" type="submit" />
          </div>
        </form>
      </motion.div>
    )
  } else if (step === 2) {
    currentForm = (
      <motion.div
        key="step-3"
        initial={{ opacity: 0, y: 20, height: 250 }}
        animate={{ opacity: 1, y: 0, height: 'fit-content' }}
        exit={{ opacity: 0, y: 20, height: 250 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handlePropSubmit(() => setStep((e) => e + 1))}>
          <div className="p-4 flex flex-col gap-2">
            <InputSelect
              options={[
                { label: 'Sim', value: 'Sim' },
                { label: 'Não', value: 'Não' }
              ]}
              onChange={(e) => setPropValue('temPropriedade', e)}
              value={watchPropValue('temPropriedade')}
              error={propErrors.temPropriedade}
              label="Tem terreno?"
            />
            <InputSelect
              options={[
                { label: 'Não possuo terreno', value: 'Nao possuo terreno' },
                { label: '100 a 200 m²', value: '100 a 200 m²' },
                { label: '200 a 300 m²', value: '200 a 300 m²' },
                { label: '300 a 400 m²', value: '300 a 400 m²' },
                { label: '400 a 500 m²', value: '400 a 500 m²' },
                { label: '+500 m²', value: '+500 m²' }
              ]}
              onChange={(e) => setPropValue('metrosDaPropriedade', e)}
              value={watchPropValue('metrosDaPropriedade')}
              error={propErrors.metrosDaPropriedade}
              label="Qual a metragem do terreno?"
            />
            <Input
              id="bairroDeConstrucao"
              label="Qual bairro da construção no DF?"
              required
              register={propRegister}
              error={propErrors.bairroDeConstrucao}
            />
            <InputSelect
              options={[
                { label: 'Sim', value: 'Sim' },
                { label: 'Não', value: 'Não' }
              ]}
              onChange={(e) => setPropValue('temProjeto', e)}
              value={watchPropValue('temProjeto')}
              error={propErrors.temProjeto}
              label="Possui projeto arquitetônico?"
            />
          </div>
          <div className="w-full flex gap-4 px-4 mt-12">
            <Button
              outline
              label="Voltar"
              type="back"
              buttonAction={() => setStep((e) => e - 1)}
            />
            <Button label="Próximo" type="submit" />
          </div>
        </form>
      </motion.div>
    )
  } else if (step === 3) {
    currentForm = (
      <motion.form
        key="step-4"
        onSubmit={handleAmountSubmit(() => setStep((e) => e + 1))}
        initial={{ opacity: 0, y: 20, height: 250 }}
        animate={{
          opacity: 1,
          y: 0,
          height: 'fit-content'
        }}
        exit={{ opacity: 0, y: 20, height: 250 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-4 grid grid-col-1 sm:grid-cols-2 gap-2 sm:overflow-auto sm:max-h-[60vh]">
          <CounterInput
            title="Suíte Master - 35m²"
            subtitle="Quantidade"
            value={watchAmoutValue('suiteMaster')}
            onAdd={() => {
              const currentAmout = getAmoutValue('suiteMaster')
              if (currentAmout < 5) {
                setAmountValue('suiteMaster', currentAmout + 1)
              }
            }}
            onReduce={() => {
              const currentAmout = getAmoutValue('suiteMaster')
              if (currentAmout > 0) {
                setAmountValue('suiteMaster', currentAmout - 1)
              }
            }}
          />
          <CounterInput
            title="Suíte - 30m²"
            subtitle="Quantidade"
            value={watchAmoutValue('suite')}
            onAdd={() => {
              const currentAmout = getAmoutValue('suite')
              if (currentAmout < 5) {
                setAmountValue('suite', currentAmout + 1)
              }
            }}
            onReduce={() => {
              const currentAmout = getAmoutValue('suite')
              if (currentAmout > 0) {
                setAmountValue('suite', currentAmout - 1)
              }
            }}
          />
          <CounterInput
            title="Quarto - 16m²"
            subtitle="Quantidade"
            value={watchAmoutValue('quarto')}
            onAdd={() => {
              const currentAmout = getAmoutValue('quarto')
              if (currentAmout < 5) {
                setAmountValue('quarto', currentAmout + 1)
              }
            }}
            onReduce={() => {
              const currentAmout = getAmoutValue('quarto')
              if (currentAmout > 0) {
                setAmountValue('quarto', currentAmout - 1)
              }
            }}
          />
          <CounterInput
            title="Sala de estar - 20m²"
            subtitle="Quantidade"
            value={watchAmoutValue('salaDeEstar')}
            onAdd={() => {
              const currentAmout = getAmoutValue('salaDeEstar')
              if (currentAmout < 5) {
                setAmountValue('salaDeEstar', currentAmout + 1)
              }
            }}
            onReduce={() => {
              const currentAmout = getAmoutValue('salaDeEstar')
              if (currentAmout > 0) {
                setAmountValue('salaDeEstar', currentAmout - 1)
              }
            }}
          />
          <CounterInput
            title="Escritório - 16m²"
            subtitle="Quantidade"
            value={watchAmoutValue('escritorio')}
            onAdd={() => {
              const currentAmout = getAmoutValue('escritorio')
              if (currentAmout < 5) {
                setAmountValue('escritorio', currentAmout + 1)
              }
            }}
            onReduce={() => {
              const currentAmout = getAmoutValue('escritorio')
              if (currentAmout > 0) {
                setAmountValue('escritorio', currentAmout - 1)
              }
            }}
          />
          <CounterInput
            title="Cozinha - 20m²"
            subtitle="Quantidade"
            value={watchAmoutValue('cozinha')}
            onAdd={() => {
              const currentAmout = getAmoutValue('cozinha')
              if (currentAmout < 5) {
                setAmountValue('cozinha', currentAmout + 1)
              }
            }}
            onReduce={() => {
              const currentAmout = getAmoutValue('cozinha')
              if (currentAmout > 0) {
                setAmountValue('cozinha', currentAmout - 1)
              }
            }}
          />
          <CounterInput
            title="Sala de jantar - 20m²"
            subtitle="Quantidade"
            value={watchAmoutValue('salaDeJantar')}
            onAdd={() => {
              const currentAmout = getAmoutValue('salaDeJantar')
              if (currentAmout < 5) {
                setAmountValue('salaDeJantar', currentAmout + 1)
              }
            }}
            onReduce={() => {
              const currentAmout = getAmoutValue('salaDeJantar')
              if (currentAmout > 0) {
                setAmountValue('salaDeJantar', currentAmout - 1)
              }
            }}
          />
          <CounterInput
            title="Lavabo - 3m²"
            subtitle="Quantidade"
            value={watchAmoutValue('lavabo')}
            onAdd={() => {
              const currentAmout = getAmoutValue('lavabo')
              if (currentAmout < 5) {
                setAmountValue('lavabo', currentAmout + 1)
              }
            }}
            onReduce={() => {
              const currentAmout = getAmoutValue('lavabo')
              if (currentAmout > 0) {
                setAmountValue('lavabo', currentAmout - 1)
              }
            }}
          />
          <CounterInput
            title="Home - 16m²"
            subtitle="Quantidade"
            value={watchAmoutValue('home')}
            onAdd={() => {
              const currentAmout = getAmoutValue('home')
              if (currentAmout < 5) {
                setAmountValue('home', currentAmout + 1)
              }
            }}
            onReduce={() => {
              const currentAmout = getAmoutValue('home')
              if (currentAmout > 0) {
                setAmountValue('home', currentAmout - 1)
              }
            }}
          />
          <CounterInput
            title="Área gourmet - 40m²"
            subtitle="Quantidade"
            value={watchAmoutValue('areaGourmet')}
            onAdd={() => {
              const currentAmout = getAmoutValue('areaGourmet')
              if (currentAmout < 5) {
                setAmountValue('areaGourmet', currentAmout + 1)
              }
            }}
            onReduce={() => {
              const currentAmout = getAmoutValue('areaGourmet')
              if (currentAmout > 0) {
                setAmountValue('areaGourmet', currentAmout - 1)
              }
            }}
          />
          <CounterInput
            title="Garagem Coberta - 20m²"
            subtitle="Quantidade"
            value={watchAmoutValue('garagemCoberta')}
            onAdd={() => {
              const currentAmout = getAmoutValue('garagemCoberta')
              if (currentAmout < 5) {
                setAmountValue('garagemCoberta', currentAmout + 1)
              }
            }}
            onReduce={() => {
              const currentAmout = getAmoutValue('garagemCoberta')
              if (currentAmout > 0) {
                setAmountValue('garagemCoberta', currentAmout - 1)
              }
            }}
          />
          <CounterInput
            title="Roupeiro - 5m²"
            subtitle="Quantidade"
            value={watchAmoutValue('roupeiro')}
            onAdd={() => {
              const currentAmout = getAmoutValue('roupeiro')
              if (currentAmout < 5) {
                setAmountValue('roupeiro', currentAmout + 1)
              }
            }}
            onReduce={() => {
              const currentAmout = getAmoutValue('roupeiro')
              if (currentAmout > 0) {
                setAmountValue('roupeiro', currentAmout - 1)
              }
            }}
          />
          <CounterInput
            title="Depósito - 6m²"
            subtitle="Quantidade"
            value={watchAmoutValue('deposito')}
            onAdd={() => {
              const currentAmout = getAmoutValue('deposito')
              if (currentAmout < 5) {
                setAmountValue('deposito', currentAmout + 1)
              }
            }}
            onReduce={() => {
              const currentAmout = getAmoutValue('deposito')
              if (currentAmout > 0) {
                setAmountValue('deposito', currentAmout - 1)
              }
            }}
          />
          <CounterInput
            title="Piscina - 40m²"
            subtitle="Quantidade"
            value={watchAmoutValue('piscina')}
            onAdd={() => {
              const currentAmout = getAmoutValue('piscina')
              if (currentAmout < 5) {
                setAmountValue('piscina', currentAmout + 1)
              }
            }}
            onReduce={() => {
              const currentAmout = getAmoutValue('piscina')
              if (currentAmout > 0) {
                setAmountValue('piscina', currentAmout - 1)
              }
            }}
          />
        </div>
        <div className="w-full flex gap-4 px-4 mt-10">
          <Button
            outline
            label="Voltar"
            type="back"
            buttonAction={() => setStep((e) => e - 1)}
          />
          <Button label="Próximo" type="submit" />
        </div>
      </motion.form>
    )
  } else {
    currentForm = (
      <motion.div
        key="step-5"
        initial={{ opacity: 0, y: 20, height: 250 }}
        animate={{ opacity: 1, y: 0, height: 'fit-content' }}
        exit={{ opacity: 0, y: 20, height: 250 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleOptionsSubmit(handleSubmitForm)}>
          <div className="p-4 flex flex-col gap-2">
            <InputSelect
              options={[
                { label: 'Prata (padrão inicial)', value: 'prata' },
                { label: 'Ouro (padrão intermediário)', value: 'ouro' },
                { label: 'Diamante (padrão luxo)', value: 'diamante' }
              ]}
              onChange={(e) => setOptionsValue('padraoDeAcabamento', e)}
              value={watchOptionsValue('padraoDeAcabamento')}
              error={optionsErrors.padraoDeAcabamento}
              label="Qual o padrão de acabamento?"
            />
            <InputSelect
              options={[
                { label: 'Em até 6 meses', value: 'ate 6 meses' },
                { label: 'Entre 6 e 12 meses', value: 'Entre 6 e 13 meses' },
                { label: 'Após 12 meses', value: 'Após 12 meses' }
              ]}
              onChange={(e) => setOptionsValue('tempoParaIniciarAObra', e)}
              value={watchOptionsValue('tempoParaIniciarAObra')}
              error={optionsErrors.tempoParaIniciarAObra}
              label="Quando pretende iniciar a obra?"
            />
            <InputSelect
              options={[
                { label: 'Até 500 mil', value: 'Ate 500 mil' },
                { label: '500 mil a 1 milhão', value: '500 mil a 1 milhao' },
                {
                  label: '1 milhão a 1.5 milhões',
                  value: '1 milhão a 1.5 milhões'
                },
                { label: 'Acima de 1,5 milhões', value: 'Acima de 1,5 milhoes' }
              ]}
              onChange={(e) => setOptionsValue('orçamentoDisponivel', e)}
              value={watchOptionsValue('orçamentoDisponivel')}
              error={optionsErrors.orçamentoDisponivel}
              label="Qual seu orçamento disponível?"
            />
            <InputSelect
              options={[
                { label: 'Financiamento', value: 'financiamento' },
                { label: 'Capital próprio', value: 'capital proprio' }
              ]}
              onChange={(e) => setOptionsValue('formaDePagamento', e)}
              value={watchOptionsValue('formaDePagamento')}
              error={optionsErrors.formaDePagamento}
              label="Como realizará o pagamento da obra?"
            />
          </div>
          <div className="w-full flex gap-4 px-4 mt-10">
            <Button
              outline
              label="Voltar"
              type="back"
              buttonAction={() => setStep((e) => e - 1)}
            />
            <Button label="Enviar orçamento" type="submit" />
          </div>
        </form>
      </motion.div>
    )
  }

  return (
    <div
      className="w-full min-h-screen flex flex-col justify-center items-center"
      style={{
        backgroundImage: 'url("./image3.png")',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'top',
        backgroundAttachment: 'fixed'
      }}
    >
      <div
        className={`
          mt-6
          rounded-md
          sm:min-h-fit
          w-[94%]
          md:w-5/6
          ${step === 3 ? 'xl:w-3/5' : 'xl:w-2/5'}
          p-5
          mx-auto
          border-0
          sm:rounded-lg
          shadow-lg
          relative
          flex
          flex-col
          justify-center
          bg-black/90
          outline-none
          focus-outline-none
          overflow-hidden
          transition-all
          duration-700
        `}
      >
        {step !== 0 && (
          <div className="w-full flex justify-around items-start mt-10 px-10">
            <StepMarker
              label={1}
              step={step}
              selected={step >= 1}
              showText={step === 1}
              text={'Contato'}
              line
            />
            <StepMarker
              label={2}
              step={step}
              selected={step >= 2}
              showText={step === 2}
              text={'Projeto'}
              line
            />
            <StepMarker
              label={3}
              step={step}
              selected={step >= 3}
              showText={step === 3}
              text={'Quantidades'}
              line
            />
            <StepMarker
              label={4}
              step={step}
              selected={step >= 4}
              showText={step === 4}
              text={'Finalização'}
            />
          </div>
        )}
        <AnimatePresence mode="wait">{currentForm}</AnimatePresence>
      </div>
    </div>
  )
}

export default App
