import React, { useEffect } from 'react';
import { withAuth } from "@/utils/middleware";
import { Col, Image, Row, Card } from 'antd';
import { getSession } from 'next-auth/react';
import Link from 'next/link';
import { useRecoilState } from 'recoil';
import { breadcrumbState } from "@/store/page";

const { Meta } = Card;

const Intelligent = () => {
  const [bc, setBc] = useRecoilState(breadcrumbState);

  useEffect(() => {
    setBc([
      { title: 'Home', href: '/' },
      { title: 'Data Analytics', href: '/intelligent' },
    ]);
  }, [setBc]);

  // รวมข้อมูลเป็น array เดียว
  const cardGroups = [
    {
      title: 'LFP',
      cards: [
        {
          href: '/intrlligentDetail?subtype=SC-F',
          imgSrc: 'images/lfp1.png',
          title: 'SC-F Series',
          bcTitle: 'SC-F',
          bcHref: '?subtype=SC-F',
          isSubtype: true,
        },
        {
          href: '/intrlligentDetail?subtype=SC-P',
          imgSrc: 'images/lfp2.png',
          title: 'SC-P Series',
          bcTitle: 'SC-P',
          bcHref: '?subtype=SC-P',
          isSubtype: true,
        },
        {
          href: '/intrlligentDetail?subtype=SC-S',
          imgSrc: 'images/lfp3.png',
          title: 'SC-S Series',
          bcTitle: 'SC-S',
          bcHref: '?subtype=SC-S',
          isSubtype: true,
        },
        {
          href: '/intrlligentDetail?subtype=SL-D',
          imgSrc: 'images/lfp4.png',
          title: 'SL-D Series',
          bcTitle: 'SL-D',
          bcHref: '?subtype=SL-D',
          isSubtype: true,
        },
      ],
    },
    {
      title: 'Projector / Others',
      cards: [
        {
          href: '/projector',
          imgSrc: 'images/p1.png',
          title: 'Projector',
          bcTitles: [
            { title: 'Home', href: '/' },
            { title: 'Data Analytics Projector' },
            { title: 'Data Analytic', href: '/projector' },
          ],
          isSubtype: false,
        },
        {
          href: '/otherCheckErrorCodeLIJ',
          imgSrc: 'images/p2.png',
          title: 'LIJ',
          bcTitles: [
            { title: 'Home', href: '/' },
            { title: 'Data Analytics LIJ' },
            { title: 'Check Error Code', href: '/otherCheckErrorCodeLIJ' },
          ],
          isSubtype: false,
        },
        {
          href: '/otherCheckErrorCode',
          imgSrc: 'images/p3.png',
          title: 'RIPs',
          bcTitles: [
            { title: 'Home', href: '/' },
            { title: 'Data Analytics RIPs' },
            { title: 'Manual', href: '/otherCheckErrorCode' },
          ],
          isSubtype: false,
        },
        {
          href: '/ServiceManualOther?type=sct',
          imgSrc: 'images/new/SC-T16.jpg',
          title: 'SC-T Series',
          bcTitles: [
            { title: 'Home', href: '/' },
            { title: 'SC-T Series' },
          ],
          isSubtype: false,
        },
      ],
    },
    {
      title: 'CISS / Scanner / SIDM & Small Printer',
      cards: [
        {
          href: '/ServiceManualOther?type=CISS',
          imgSrc: 'images/new/CISS14.png',
          title: 'CISS',
          bcTitles: [
            { title: 'Home', href: '/' },
            { title: 'CISS' },
          ],
          isSubtype: false,
        },
        {
          href: '/ServiceManualOther?type=Scanner',
          imgSrc: 'images/new/Scanner15.png',
          title: 'Scanner',
          bcTitles: [
            { title: 'Home', href: '/' },
            { title: 'Scanner' },
          ],
          isSubtype: false,
        },
        {
          href: '/ServiceManualOther?type=SIDM',
          imgSrc: 'images/new/SIDM17.png',
          title: 'SIDM',
          bcTitles: [
            { title: 'Home', href: '/' },
            { title: 'SIDM' },
          ],
          isSubtype: false,
        },
        {
          href: '/ServiceManualOther?type=SmallPrinter',
          imgSrc: 'images/new/Small Printer18.png',
          title: 'Small Printer',
          bcTitles: [
            { title: 'Home', href: '/' },
            { title: 'Small Printer' },
          ],
          isSubtype: false,
        },
      ],
    },
  ];

  const updateBcWithSubtype = (subtypeTitle, subtypeHref) => {
    const filteredBc = bc.filter(v => !(v.href && v.href.startsWith('?subtype=')));
    setBc([...filteredBc, { title: subtypeTitle, href: subtypeHref }]);
  };

  return (
    <>
      {cardGroups.map(({ title, cards }) => (
        <React.Fragment key={title}>
          <Row justify="center">
            <Col span={20} style={{ margin: '10px' }}>
              <h3>{title}</h3>
            </Col>
          </Row>
          <Row justify="center" gutter={[16, 16]}>
            {cards.map(card => (
              <Col span={5} key={card.href} style={{ margin: '10px' }}>
                <Link
                  href={card.href}
                  onClick={() => {
                    if (card.isSubtype) {
                      updateBcWithSubtype(card.bcTitle, card.bcHref);
                    } else {
                      setBc(card.bcTitles);
                    }
                  }}
                >
                  <Card hoverable style={{ textAlign: 'center' }} cover={<Image alt="" preview={false} src={card.imgSrc} />}>
                    <div style={{ marginTop: 'auto' }}>
                      <Meta title={card.title} description="" />
                    </div>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </React.Fragment>
      ))}
    </>
  );
};

export async function getServerSideProps(context) {
  context.res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  const session = await getSession(context);
  if (!session) {
    return {
      redirect: { destination: '/auth/login?authen', permanent: false },
    };
  }
  return { props: {} };
}

export default withAuth(Intelligent);
