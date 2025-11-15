import heroBanner from '../../assets/images/dashboard/hero-banner.png';
const Dashboard: React.FC = () => {
  return (
    <>
      <section>
        <div className="flex justify-center px-4 w-full">
          <div className="flex flex-row justify-center max-w-[800px] w-full">
            <div className="flex flex-col max-w-[150px] mr-[-100px] mt-[20px] w-full z-10">
              <h1 className="text-xl/7 text-blod text-primary-800">
                Good Morning,
              </h1>
              <h1 className="text-xl text-blod text-primary-800 mb-4">
                Jocelyn.
              </h1>
              <p className="text-sm text-neutral-500 py-1 px-3 bg-[#FEF3F2] rounded-b-xl rounded-tl-xl">
                歡迎回到冰箱小隊～
              </p>
            </div>
            <img
              className="max-w-[300px] w-full h-auto object-cover"
              src={heroBanner}
              alt=""
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
