import React from 'react';
import { useQuery } from 'react-query';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useTypedController } from '@hookform/strictly-typed';
import { TextInput } from 'hds-react';
import { FormProps, FORMFIELD, CONTACT_FORMFIELD, HankeDataDraft } from './types';
import api from '../../../common/utils/api';
import H2 from '../../../common/components/text/H2';
import H3 from '../../../common/components/text/H3';
import Autocomplete, { Option } from '../../../common/components/autocomplete/Autocomplete';

const CONTACT_TYPES = [FORMFIELD.OMISTAJAT, FORMFIELD.ARVIOIJAT, FORMFIELD.TOTEUTTAJAT];
const CONTACT_FIELDS = [
  CONTACT_FORMFIELD.ETUNIMI,
  CONTACT_FORMFIELD.SUKUNIMI,
  CONTACT_FORMFIELD.EMAIL,
  CONTACT_FORMFIELD.PUHELINNUMERO,
  CONTACT_FORMFIELD.OSASTO,
];

type OrganizationList = Array<{
  id: number;
  nimi: string;
  tunnus: string;
}>;

// https://github.com/microsoft/TypeScript/issues/26781
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetchOrganizations = async (): Promise<any> => {
  try {
    return await api.get<OrganizationList>(`/organisaatiot`);
  } catch (e) {
    return [];
  }
};

const Form2: React.FC<FormProps> = ({ control, formData, register }) => {
  const { t } = useTranslation();
  const { setValue } = useFormContext();
  const TypedController = useTypedController<HankeDataDraft>({ control });

  const { isFetched, data } = useQuery<OrganizationList>('organisationList', fetchOrganizations, {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return (
    <div className="form2">
      <H2>{t('hankeForm:hankkeenYhteystiedotForm:header')}</H2>
      {CONTACT_TYPES.map((CONTACT_TYPE) => (
        <div key={CONTACT_TYPE}>
          <H3>{t(`hankeForm:headers:${CONTACT_TYPE}`)}</H3>
          <div className="formColumns">
            {CONTACT_FIELDS.map((contactField) => (
              <React.Fragment key={contactField}>
                <TypedController
                  // eslint-disable-next-line
                  // @ts-ignore
                  name={[CONTACT_TYPE, 0, contactField]}
                  defaultValue={
                    // eslint-disable-next-line
                    // @ts-ignore
                    formData[CONTACT_TYPE][0] ? formData[CONTACT_TYPE][0][contactField] : ''
                  }
                  render={(props) => (
                    <TextInput
                      className="formItem"
                      label={t(`hankeForm:labels:${contactField}`)}
                      id={`${CONTACT_TYPE}-${contactField}`}
                      ref={register}
                      data-testid={`${CONTACT_TYPE}-${contactField}`}
                      {...props}
                    />
                  )}
                />
                {contactField === CONTACT_FORMFIELD.PUHELINNUMERO && isFetched && (
                  <Autocomplete
                    className="formItem"
                    label={t(`hankeForm:labels:organisaatio`)}
                    options={
                      data
                        ? data.map((v) => ({
                            value: v.id,
                            label: v.nimi,
                          }))
                        : []
                    }
                    defaultValue={{
                      label:
                        // eslint-disable-next-line
                        // @ts-ignore
                        formData[CONTACT_TYPE][0] ? formData[CONTACT_TYPE][0].organisaatioNimi : '',
                      value:
                        // eslint-disable-next-line
                        // @ts-ignore
                        formData[CONTACT_TYPE][0] ? formData[CONTACT_TYPE][0].organisaatioId : '',
                    }}
                    onChange={(option?: Option): void => {
                      if (option) {
                        setValue(`${CONTACT_TYPE}[0].organisaatioId`, option.value);
                        setValue(`${CONTACT_TYPE}[0].organisaatioNimi`, option.label);
                      }
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
export default Form2;
