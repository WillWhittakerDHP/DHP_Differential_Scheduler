import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { getAllServices } from '../../components/settingSelections/routes/userAPI/servicesRoutes';


export default function ServiceSelectorDropDown() {
  const services = getAllServices();
  return (
    <DropdownButton id="dropdown-basic-button" title="Dropdown button">
      {services.map((service) => (
          <Dropdown.Item href={service.id}>{service.title}</Dropdown.Item>
        ))}
    </DropdownButton>
  );
}